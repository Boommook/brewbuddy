"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInAction, type AuthFormState } from "../actions/auth";
import { AUTH_PASSWORD_MIN, AUTH_USERNAME_MIN } from "../../lib/auth/constants";
import { Button } from "../components/ui/button";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    signInAction, // action to perform on form submission
    undefined // initial state
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state?.error ? (
        <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col gap-1">
        <label htmlFor="login-username" className="text-sm font-medium text-gray-800">
          Username
        </label>
        <input
          id="login-username"
          name="username"
          required
          minLength={AUTH_USERNAME_MIN}
          autoComplete="username"
          className="auth-input-style"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="login-password" className="text-sm font-medium text-gray-800">
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          required
          minLength={AUTH_PASSWORD_MIN}
          autoComplete="current-password"
          className="auth-input-style"
        />
      </div>

      <Button type="submit" 
      className="mt-2 w-full save-button"
       disabled={pending}>
        {pending ? "Signing in…" : "Log in"}
      </Button>

      <p className="text-center text-sm text-gray-700">
        No account?{" "}
        <Link href="/register" className="font-medium underline text-bright-blue-700">
          Register
        </Link>
      </p>
    </form>
  );
}
