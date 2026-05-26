"use client";

import { useEffect, useState } from "react";
import { RecipeDTO } from "@/src/types/recipe";

export default function RecipeSelect({ setSelectedRecipe, selectedRecipe }: { setSelectedRecipe: (recipe: RecipeDTO) => void, selectedRecipe: RecipeDTO | null }) {
    const [recipes, setRecipes] = useState<RecipeDTO[]>([]);

    useEffect(() => {
        const fetchRecipes = async () => {
            const res = await fetch("/api/recipes");
            if (!res.ok) {
                throw new Error("Failed to fetch recipes");
            }
            const data = await res.json();
            if (!data.ok || !Array.isArray(data.recipes)) {
                throw new Error("Failed to fetch recipes");
            }
            const recipes = data.recipes;
            setRecipes(recipes);
        };
        fetchRecipes();
    }, []);
    return (
        <div className="rounded-lg border border-antique-white-600 bg-antique-white-200/40 p-4 ">
            <h2 className="heading-style text-lg font-bold text-gray-900 mb-2">Select a recipe</h2>
            <div className="grid grid-cols-4 gap-8 rounded-md border border-antique-white-500 bg-antique-white-100/80 p-3 inset-shadow-md inset-shadow-black/25">
                {recipes.map((recipe) => (
                    <div key={recipe.id} className={`recipe-select-button ${selectedRecipe?.id === recipe.id ? "recipe-select-button-active" : ""}`} onClick={() => setSelectedRecipe(recipe)}>
                        <h2>{recipe.name}</h2>
                    </div>
                ))}
            </div>
        </div>
    );
}