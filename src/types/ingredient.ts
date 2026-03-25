import type { IngredientType } from "../generated/prisma/index.js";

export type IngredientDTO = {
  id: string;
  userId: string | null;
  name: string;
  ingredientType: IngredientType;
  brand: string | null;
  defaultUnit: string | null;
  notes: string | null;
  isGlobal: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateIngredientInput = {
  name: string;
  ingredientType: IngredientType;
  brand?: string | null;
  defaultUnit?: string | null;
  notes?: string | null;
  // omit for user-scoped rows; set when creating catalog entries.
  isGlobal?: boolean;
};

export type UpdateIngredientInput = {
  name?: string;
  ingredientType?: IngredientType;
  brand?: string | null;
  defaultUnit?: string | null;
  notes?: string | null;
  isArchived?: boolean;
};
