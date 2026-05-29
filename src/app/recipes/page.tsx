import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserId } from "@/src/server/auth";
import { listRecipes } from "@/src/server/recipes";
import RecipesGrid from "../components/RecipesGrid";
import {Plus} from "lucide-react";

export default async function RecipesPage() {
  const userId = await getUserId();
  if (!userId) {
    redirect("/login");
  }

  const recipes = await listRecipes();
  if (!recipes) {
    redirect("/login");
  }

  return (
    <div className="mx-auto my-8 rounded-xl border-2 border-harvest-orange-700 max-w-7xl px-4 py-6 md:px-8 bg-camel/75">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 ">
        <div>
          <h1 className="zilla-slab-bold text-3xl text-gray-900">Recipes</h1>
          <p className="mt-2 max-w-2xl text-gray-700">
            Browse global templates and your own recipes. Global recipes are
            read-only; your recipes can be edited or deleted.
          </p>
        </div>
        <Link
          href="/createrecipe"
          className="save-button inline-flex items-center justify-center rounded-lg px-4 py-2"
        >
          <div className="flex items-center gap-2">
            <Plus className="size-4" />
            <span>New Recipe</span>
          </div>
        </Link>
      </div>

      <RecipesGrid recipes={recipes} currentUserId={userId} />
    </div>
  );
}
