import { createRecipe, listRecipes } from "@/src/server/recipes";
import type { CreateRecipeInput } from "@/src/types/recipe";
import { NextResponse } from "next/server";


export async function GET() {
    try {
        const recipes = await listRecipes();
        return NextResponse.json({ ok: true, recipes });
      } catch {
        return NextResponse.json(
          { ok: false, error: "Unauthorized" },
          { status: 401 }
        );
      }
    }

export async function POST(req: Request) {
    let body: CreateRecipeInput;
    try {
        body = await req.json();
    } 
    catch {
        return NextResponse.json(
          { ok: false, error: "Invalid JSON" },
          { status: 400 }
        );
    }
    
      // error checking for invalid input of required fields
      if (
        typeof body.name !== "string" ||
        typeof body.category !== "string" ||
        typeof body.targetVolume !== "number" ||
        !Array.isArray(body.ingredients)
      ) {
        return NextResponse.json(
          { ok: false, error: "name, category, targetVolume, and ingredients are required" },
          { status: 400 }
        );
      }

      // create new recipe
      try {
        const created = await createRecipe(body);
        return NextResponse.json({ ok: true, recipe: created });
      } catch (e) {
        // error handling
        return NextResponse.json(
          { ok: false, error: e instanceof Error ? e.message : "Failed to create recipe" },
          { status: 400 }
        );
      }
}