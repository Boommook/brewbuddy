import { NextResponse } from "next/server";
import { getIngredientsForUserCatalog } from "@/src/server/ingredients";

export async function GET() {
  try {
    const ingredients = await getIngredientsForUserCatalog();
    return NextResponse.json({ ok: true, ingredients });
  } catch {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
}
