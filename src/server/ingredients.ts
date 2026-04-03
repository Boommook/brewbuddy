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

/*
  return all ingredients (global and user-specific) for the current user
*/
export async function getIngredientsForUserCatalog(): Promise<IngredientDTO[]> {
  // get the current user id from the session
  const userId = await getUserId();
  if (!userId) throw new Error("User not found"); // ensure a user is logged in

  // get all rows where the ingredient is not archived and either is global or belongs to the user
  const rows = await prisma.ingredient.findMany({
    where: {
      isArchived: false,
      OR: [{ isGlobal: true }, { userId }],
    },
    // order the ingredients by type and name
    orderBy: [{ ingredientType: "asc" }, { name: "asc" }],
  });

  // map the rows to ingredient DTOs
  return rows.map(toIngredientDTO);
}
