import { NextResponse } from "next/server";
import { signOutSession } from "../../../../server/auth-credentials";

export async function POST() {
  await signOutSession();
  return NextResponse.json({ ok: true });
}
