import { NextResponse } from "next/server";
import { signInWithCredentials } from "@/src/server/auth-credentials";

export async function POST(req: Request) {
  let body: { username?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const username =
    typeof body.username === "string" ? body.username : "";
  const password =
    typeof body.password === "string" ? body.password : "";

  const result = await signInWithCredentials(username, password);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    ok: true,
    user: result.user,
  });
}
