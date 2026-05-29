import {
  archiveRecipe,
  getRecipe,
  updateRecipe,
} from "@/src/server/recipes";
import type { UpdateRecipeInput } from "@/src/types/recipe";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    const recipe = await getRecipe(id);
    if (!recipe) {
      return NextResponse.json(
        { ok: false, error: "Recipe not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, recipe });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  let body: UpdateRecipeInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  if (
    typeof body.name !== "string" ||
    typeof body.category !== "string" ||
    typeof body.targetVolume !== "number" ||
    !Array.isArray(body.ingredients)
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: "name, category, targetVolume, and ingredients are required",
      },
      { status: 400 }
    );
  }

  try {
    const recipe = await updateRecipe(id, body);
    return NextResponse.json({ ok: true, recipe });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update recipe";
    const status =
      message === "Unauthorized" || message === "Recipe not found or not editable"
        ? message === "Unauthorized"
          ? 401
          : 404
        : 400;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  try {
    await archiveRecipe(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to delete recipe";
    const status =
      message === "Unauthorized"
        ? 401
        : message === "Recipe not found or not deletable"
          ? 404
          : 400;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
