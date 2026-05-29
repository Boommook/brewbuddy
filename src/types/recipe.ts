import type {
  BrewCategory,
  MeadSubtype,
  VolumeUnit,
} from "../generated/prisma/index.js";
import type { IngredientLineDTO, IngredientLineInput } from "./ingredientLine";

export type RecipeDTO = {
  id: string;
  userId: string | null;
  name: string;
  description: string | null;
  targetVolume: number;
  targetVolumeUnit: VolumeUnit;
  category: BrewCategory | null;
  meadSubtype: MeadSubtype | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  ingredients: RecipeIngredientDTO[];
};

export type RecipeIngredientDTO = IngredientLineDTO & {
  recipeId: string;
  sortOrder: number;
};

export type CreateRecipeIngredientInput = IngredientLineInput;

export type CreateRecipeInput = {
  name: string;
  description: string | null;
  targetVolume: number;
  targetVolumeUnit: VolumeUnit;
  category: BrewCategory | null;
  meadSubtype: MeadSubtype | null;
  ingredients: CreateRecipeIngredientInput[];
};

export type UpdateRecipeInput = CreateRecipeInput;

export type CreateBatchFromRecipeInput = {
  recipeId: string;
  name: string;
  startDate: string;
  notes: string | null;
};