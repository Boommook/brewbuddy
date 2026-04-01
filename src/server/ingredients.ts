import "server-only";

import { prisma } from "../lib/prisma";
import { getUserId } from "./auth";
import type { IngredientType } from "../generated/prisma/index.js";
import type { IngredientDTO } from "../types/ingredient";

function toIngredientDTO(row: {
  id: string;
  userId: string | null;
  name: string;
  ingredientType: IngredientType;
  brand: string | null;
  defaultUnit: string | null;
  notes: string | null;
  isGlobal: boolean;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}): IngredientDTO {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    ingredientType: row.ingredientType,
    brand: row.brand,
    defaultUnit: row.defaultUnit,
    notes: row.notes,
    isGlobal: row.isGlobal,
    isArchived: row.isArchived,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getIngredientsForUserCatalog(): Promise<IngredientDTO[]> {
  const userId = await getUserId();
  if (!userId) throw new Error("User not found");

  const rows = await prisma.ingredient.findMany({
    where: {
      isArchived: false,
      OR: [{ isGlobal: true }, { userId }],
    },
    orderBy: [{ ingredientType: "asc" }, { name: "asc" }],
  });

  return rows.map(toIngredientDTO);
}
