import { NextResponse } from "next/server";
import { signUpWithCredentials } from "../../../../server/auth-credentials";

export async function POST(req: Request) {
  let body: {
    username?: unknown;
    password?: unknown;
    confirmPassword?: unknown;
    displayName?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const username =
    typeof body.username === "string" ? body.username : "";
  const password =
    typeof body.password === "string" ? body.password : "";
  const confirmPassword =
    typeof body.confirmPassword === "string"
      ? body.confirmPassword
      : undefined;
  const displayName =
    typeof body.displayName === "string" ? body.displayName : undefined;

  const result = await signUpWithCredentials({
    username,
    password,
    confirmPassword,
    displayName,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    ok: true,
    user: result.user,
  });
}
