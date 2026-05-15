"use server";

import { redirect } from "next/navigation";
import {
  signInWithCredentials,
  signOutSession,
  signUpWithCredentials,
} from "../../server/auth-credentials";

export type AuthFormState = { error?: string } | undefined;

export async function signInAction(
  prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const username = formData.get("username");
  const password = formData.get("password");

  if (typeof username !== "string" || typeof password !== "string") {
    return { error: "Invalid form submission." };
  }

  const result = await signInWithCredentials(username, password);
  if (!result.ok) {
    return { error: result.error };
  }

  redirect("/");
}

export async function signUpAction(
  prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const username = formData.get("username");
  const password = formData.get("password");
  const confirmPassword = formData.get("confirmPassword");
  const displayName = formData.get("displayName");
  const email = formData.get("email");


  if (typeof username !== "string" || typeof password !== "string" || typeof email !== "string") {
    return { error: "Invalid form submission." };
  }

  const result = await signUpWithCredentials({
    username,
    password,
    email,
    confirmPassword:
      typeof confirmPassword === "string" ? confirmPassword : undefined,
    displayName:
      typeof displayName === "string" ? displayName : undefined,
  });

  if (!result.ok) {
    return { error: result.error };
  }

  redirect("/check-email");
}

export async function signOutAction(): Promise<void> {
  await signOutSession();
  redirect("/login");
}
