import "server-only";

import { cookies } from "next/headers";
import {
  buildSessionToken,
  parseSessionToken,
  SESSION_COOKIE_NAME,
} from "../lib/auth/session";

const SESSION_MAX_AGE_S = 60 * 60 * 24 * 30; // 30 days

function requireSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_SECRET must be set to a long random string (at least 16 characters)"
    );
  }
  return secret;
}

// current user id from the HTTP-only session cookie, or `null` if logged out / invalid.
export async function getUserId(): Promise<string | null> {
  let secret: string;
  try {
    secret = requireSessionSecret();
  } catch {
    return null;
  }

  const store = await cookies();
  const raw = store.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;

  const parsed = parseSessionToken(raw, secret);
  return parsed?.sub ?? null;
}

// call from a route handler or server action after successful password check.
export async function setSessionUserId(userId: string): Promise<void> {
  const secret = requireSessionSecret();
  const expiresAtMs = Date.now() + SESSION_MAX_AGE_S * 1000;
  const token = buildSessionToken(userId, expiresAtMs, secret);

  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_S,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}

