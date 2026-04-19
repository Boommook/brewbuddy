"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpAction, type AuthFormState } from "../actions/auth";
import {
  AUTH_PASSWORD_MIN,
  AUTH_USERNAME_MAX,
  AUTH_USERNAME_MIN,
} from "../../lib/auth/constants";
import { Button } from "../components/ui/button";

export function RegisterForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    signUpAction,
    undefined
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error ? (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col gap-1">
        <label htmlFor="register-username" className="text-sm font-medium text-gray-800">
          Username
        </label>
        <input
          id="register-username"
          name="username"
          required
          minLength={AUTH_USERNAME_MIN}
          maxLength={AUTH_USERNAME_MAX}
          autoComplete="username"
          pattern="[a-zA-Z0-9_-]+"
          title="Letters, numbers, underscores, and hyphens only"
          className="auth-input-style"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="register-display" className="text-sm font-medium text-gray-800">
          Display name <span className="font-normal text-gray-500">(optional)</span>
        </label>
        <input
          id="register-display"
          name="displayName"
          autoComplete="nickname"
          className="auth-input-style"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="register-password" className="text-sm font-medium text-gray-800">
          Password
        </label>
        <input
          id="register-password"
          name="password"
          type="password"
          required
          minLength={AUTH_PASSWORD_MIN}
          autoComplete="new-password"
          className="auth-input-style"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor="register-confirm"
          className="text-sm font-medium text-gray-800"
        >
          Confirm password
        </label>
        <input
          id="register-confirm"
          name="confirmPassword"
          type="password"
          required
          minLength={AUTH_PASSWORD_MIN}
          autoComplete="new-password"
          className="auth-input-style"
        />
      </div>

      <Button type="submit" className="mt-2 w-full save-button" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-sm text-gray-700">
        Already have an account?{" "}
        <Link href="/login" className="font-medium underline text-bright-blue-700">
          Log in
        </Link>
      </p>
    </form>
  );
}
