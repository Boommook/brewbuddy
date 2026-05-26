import type { BatchStage } from "../generated/prisma/index.js";
import type { IngredientDTO } from "./ingredient";

export type IngredientReference = {
  ingredientId: string | null;
  customIngredientName: string | null;
};

export type IngredientLineInput = IngredientReference & {
  amount: number;
  unit: string;
  stageAdded?: BatchStage;
  notes?: string | null;
};

export type IngredientLineDTO = IngredientReference & {
  id: string;
  amount: number;
  unit: string;
  stageAdded: BatchStage;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  ingredient: IngredientDTO | null;
};
