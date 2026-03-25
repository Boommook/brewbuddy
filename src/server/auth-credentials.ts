import "server-only";

import { prisma } from "../lib/prisma";
import {
  AUTH_PASSWORD_MAX,
  AUTH_PASSWORD_MIN,
  AUTH_USERNAME_MAX,
  AUTH_USERNAME_MIN,
} from "../lib/auth/constants";
import { hashPassword, verifyPassword } from "../lib/auth/password";
import { clearSession, getUserId, setSessionUserId } from "./auth";

export type PublicAuthUser = {
  id: string;
  username: string;
  displayName: string | null;
};

export type AuthResult =
  | { ok: true; user: PublicAuthUser }
  | { ok: false; error: string; status: number };

export {
  AUTH_PASSWORD_MAX,
  AUTH_PASSWORD_MIN,
  AUTH_USERNAME_MAX,
  AUTH_USERNAME_MIN,
} from "../lib/auth/constants";

// letters, digits, underscore, hyphen only.
const USERNAME_PATTERN = /^[a-zA-Z0-9_-]+$/;

function validateUsername(username: string): string | null {
  if (username.length < AUTH_USERNAME_MIN) {
    return `Username must be at least ${AUTH_USERNAME_MIN} characters.`;
  }
  if (username.length > AUTH_USERNAME_MAX) {
    return `Username must be at most ${AUTH_USERNAME_MAX} characters.`;
  }
  if (!USERNAME_PATTERN.test(username)) {
    return "Username may only contain letters, numbers, underscores, and hyphens.";
  }
  return null;
}

function validatePassword(password: string): string | null {
  if (password.length < AUTH_PASSWORD_MIN) {
    return `Password must be at least ${AUTH_PASSWORD_MIN} characters.`;
  }
  if (password.length > AUTH_PASSWORD_MAX) {
    return `Password must be at most ${AUTH_PASSWORD_MAX} characters.`;
  }
  return null;
}

function toPublicAuthUser(user: {
  id: string;
  username: string;
  displayName: string | null;
}): PublicAuthUser {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
  };
}

// look up the signed-in user row.
// returns `null` if there is no session or the user row is missing.
export async function getSessionUser(): Promise<PublicAuthUser | null> {
  const userId = await getUserId();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, username: true, displayName: true },
  });

  return user ? toPublicAuthUser(user) : null;
}

// validate credentials, set the session cookie.
// call only from a route handler or server action.
export async function signInWithCredentials(
  rawUsername: string,
  rawPassword: string
): Promise<AuthResult> {
  const username = rawUsername.trim();
  const password = rawPassword;

  // check that user and pw were received
  if (!username || !password) {
    return {
      ok: false,
      error: "Username and password are required.",
      status: 400,
    };
  }
  // check db for user
  const user = await prisma.user.findUnique({
    where: { username },
  });

  // error handling
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return {
      ok: false,
      error: "Invalid username or password.",
      status: 401,
    };
  }

  // set session cookie and return user
  await setSessionUserId(user.id);
  return { ok: true, user: toPublicAuthUser(user) };
}

export type SignUpFields = {
  username: string;
  password: string;
  // when provided and non-empty, must equal `password`.
  confirmPassword?: string;
  displayName?: string | null;
};

// create account, hash password, set session.
// call only from a route handler or server action.
export async function signUpWithCredentials(
  fields: SignUpFields
): Promise<AuthResult> {
  const username = fields.username.trim();
  const password = fields.password;
  const displayName =
    fields.displayName && fields.displayName.trim().length > 0
      ? fields.displayName.trim()
      : null;

  const uErr = validateUsername(username);
  if (uErr) return { ok: false, error: uErr, status: 400 };

  const pErr = validatePassword(password);
  if (pErr) return { ok: false, error: pErr, status: 400 };

  if (
    fields.confirmPassword !== undefined &&
    fields.confirmPassword !== "" &&
    fields.confirmPassword !== password
  ) {
    return { ok: false, error: "Passwords do not match.", status: 400 };
  }

  const passwordHash = hashPassword(password);

  try {
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        displayName,
      },
    });

    await setSessionUserId(user.id);
    return { ok: true, user: toPublicAuthUser(user) };
  } catch {
    return {
      ok: false,
      error: "That username is already taken.",
      status: 409,
    };
  }
}

export async function signOutSession(): Promise<void> {
  await clearSession();
}

