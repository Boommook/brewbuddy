"use client";

import { useEffect, useState } from "react";
import type { RecipeDTO } from "@/src/types/recipe";

type RecipeSelectProps = {
  setSelectedRecipe: (recipe: RecipeDTO) => void;
  selectedRecipe: RecipeDTO | null;
  importing?: boolean;
};

export default function RecipeSelect({
  setSelectedRecipe,
  selectedRecipe,
  importing = false,
}: RecipeSelectProps) {
  const [recipes, setRecipes] = useState<RecipeDTO[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const res = await fetch("/api/recipes");
        if (!res.ok) {
          throw new Error("Failed to fetch recipes");
        }
        const data = await res.json();
        if (!data.ok || !Array.isArray(data.recipes)) {
          throw new Error("Failed to fetch recipes");
        }
        setRecipes(data.recipes);
        setLoadError(null);
      } catch (error) {
        setLoadError(
          error instanceof Error ? error.message : "Failed to fetch recipes"
        );
      }
    };
    fetchRecipes();
  }, []);

  return (
    <div className="rounded-lg border border-antique-white-600 bg-antique-white-200/40 px-4 pt-2 pb-4 ">
      <h2 className="heading-style text-lg font-bold text-gray-900 mb-2">
        Select a recipe
      </h2>
      {loadError ? (
        <p className="mb-2 text-sm text-red-900">{loadError}</p>
      ) : null}
      {importing ? (
        <p className="mb-2 text-sm text-gray-700">Loading recipe ingredients…</p>
      ) : null}
      <div className="grid grid-cols-4 gap-8 rounded-md border border-antique-white-500 bg-antique-white-100/80 p-3 inset-shadow-md inset-shadow-black/25">
        {recipes.map((recipe) => (
          <div
            key={recipe.id}
            className={`recipe-select-button ${selectedRecipe?.id === recipe.id ? "recipe-select-button-active" : ""} ${importing ? "pointer-events-none opacity-60" : ""}`}
            onClick={() => setSelectedRecipe(recipe)}
          >
            <h2>{recipe.name}</h2>
            <p className="text-xs text-gray-700">
              {recipe.ingredients?.length ?? 0} ingredient
              {(recipe.ingredients?.length ?? 0) === 1 ? "" : "s"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
