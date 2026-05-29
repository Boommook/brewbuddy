import "server-only";

import { prisma } from "../lib/prisma";
import { getUserId } from "./auth";
import type { Ingredient, Recipe, RecipeIngredient } from "../generated/prisma/index.js";
import { redirect } from "next/navigation";
import { normalizeIngredientLineInputs } from "../lib/ingredientLine";
import type {
  CreateRecipeInput,
  CreateRecipeIngredientInput,
  RecipeDTO,
  RecipeIngredientDTO,
  UpdateRecipeInput,
} from "../types/recipe";

type RecipeWithIngredients = Recipe & {
  ingredients: Array<RecipeIngredient & { ingredient: Ingredient | null }>;
};

function toRecipeIngredientDTO(
  ingredient: RecipeWithIngredients["ingredients"][number]
): RecipeIngredientDTO {
  return {
    id: ingredient.id,
    recipeId: ingredient.recipeId,
    sortOrder: ingredient.sortOrder,
    ingredientId: ingredient.ingredientId,
    customIngredientName: ingredient.customIngredientName,
    amount: Number(ingredient.amount),
    unit: ingredient.unit,
    stageAdded: ingredient.stageAdded,
    notes: ingredient.notes,
    createdAt: ingredient.createdAt.toISOString(),
    updatedAt: ingredient.updatedAt.toISOString(),
    ingredient: ingredient.ingredient
      ? {
          ...ingredient.ingredient,
          createdAt: ingredient.ingredient.createdAt.toISOString(),
          updatedAt: ingredient.ingredient.updatedAt.toISOString(),
        }
      : null,
  };
}

function toRecipeDTO(recipe: RecipeWithIngredients): RecipeDTO {
  return {
    id: recipe.id,
    userId: recipe.userId,
    name: recipe.name,
    description: recipe.description,
    targetVolume: Number(recipe.targetVolume),
    targetVolumeUnit: recipe.targetVolumeUnit,
    category: recipe.category,
    meadSubtype: recipe.meadSubtype,
    isArchived: recipe.isArchived,
    createdAt: recipe.createdAt.toISOString(),
    updatedAt: recipe.updatedAt.toISOString(),
    ingredients: recipe.ingredients.map(toRecipeIngredientDTO),
  };
}

export async function listRecipes() {
    const userId = await getUserId();
    if (!userId) {
        redirect('/login');
        return;
    }

    const recipes = await prisma.recipe.findMany({
        where: {
            isArchived: false,
            OR: [{ userId }, { userId: null }],
        },
        include: {
            ingredients: {
                include: {
                    ingredient: true,
                },
                orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return recipes.map(toRecipeDTO);
}

export async function listUserRecipes() {
    const userId = await getUserId();
    if (!userId) {
        redirect('/login');
        return;
    }

    const recipes = await prisma.recipe.findMany({
        where: {
            userId,
            isArchived: false,
        },
        include: {
            ingredients: {
                include: {
                    ingredient: true,
                },
                orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return recipes.map(toRecipeDTO);
}

export async function getRecipe(id: string) {
    const userId = await getUserId();
    if (!userId) return null;

    const recipe = await prisma.recipe.findFirst({
        where: {
            id,
            OR: [{ userId }, { userId: null }],
        },
        include: {
            ingredients: {
                include: {
                    ingredient: true,
                },
                orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            },
        },
    });

    return recipe ? toRecipeDTO(recipe) : null;
}

export function normalizeIngredients(
    raw: CreateRecipeIngredientInput[] | undefined
): CreateRecipeIngredientInput[] {
    return normalizeIngredientLineInputs(raw);
}

export async function createRecipe(input: CreateRecipeInput) {
    const userId = await getUserId();
    if (!userId) {
        redirect('/login');
        return;
    }

    const ingredients = normalizeIngredients(input.ingredients);

    const recipe = await prisma.recipe.create({
        data: {
            userId: userId,
            name: input.name,
            description: input.description,
            targetVolume: input.targetVolume,
            targetVolumeUnit: input.targetVolumeUnit,
            category: input.category,
            meadSubtype: input.meadSubtype,
            ingredients: {
                create: ingredients,
            },
        },
        include: {
            ingredients: {
                include: {
                    ingredient: true,
                },
                orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
            },
        },
    });
    return toRecipeDTO(recipe);
}

async function requireOwnedRecipe(recipeId: string, userId: string) {
    const recipe = await prisma.recipe.findFirst({
        where: {
            id: recipeId,
            userId,
            isArchived: false,
        },
    });

    if (!recipe) {
        throw new Error("Recipe not found or not editable");
    }

    return recipe;
}

export async function updateRecipe(recipeId: string, input: UpdateRecipeInput) {
    const userId = await getUserId();
    if (!userId) {
        redirect("/login");
        return;
    }

    await requireOwnedRecipe(recipeId, userId);
    const ingredients = normalizeIngredients(input.ingredients);

    const recipe = await prisma.$transaction(async (tx) => {
        await tx.recipeIngredient.deleteMany({
            where: { recipeId },
        });

        return tx.recipe.update({
            where: { id: recipeId },
            data: {
                name: input.name,
                description: input.description,
                targetVolume: input.targetVolume,
                targetVolumeUnit: input.targetVolumeUnit,
                category: input.category,
                meadSubtype: input.meadSubtype,
                ingredients: {
                    create: ingredients.map((ingredient, index) => ({
                        ...ingredient,
                        sortOrder: index,
                    })),
                },
            },
            include: {
                ingredients: {
                    include: {
                        ingredient: true,
                    },
                    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
                },
            },
        });
    });

    return toRecipeDTO(recipe);
}

export async function archiveRecipe(recipeId: string) {
    const userId = await getUserId();
    if (!userId) {
        throw new Error("Unauthorized");
    }

    const updated = await prisma.recipe.updateMany({
        where: {
            id: recipeId,
            userId,
            isArchived: false,
        },
        data: {
            isArchived: true,
        },
    });

    if (updated.count === 0) {
        throw new Error("Recipe not found or not deletable");
    }
}