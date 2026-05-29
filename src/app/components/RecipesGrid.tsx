"use client";

import type { RecipeDTO } from "@/src/types/recipe";
import RecipeCard from "./RecipeCard";

type RecipesGridProps = {
  recipes: RecipeDTO[];
  currentUserId: string;
};

export default function RecipesGrid({ recipes, currentUserId }: RecipesGridProps) {
  if (recipes.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-harvest-orange-700 bg-antique-white-100/60 px-6 py-12 text-center">
        <p className="text-lg font-semibold text-gray-900">No recipes yet</p>
        <p className="mt-2 text-gray-700">
          Create your first recipe to reuse ingredient lists when starting batches.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} currentUserId={currentUserId} />
      ))}
    </div>
  );
}
