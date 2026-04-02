import type {
  BatchStatus,
  BatchStage,
  BrewCategory,
  Prisma,
} from "../generated/prisma/index.js";

// json-serializable batch row; matches `toBatchDTO` in `lib/utils/batch.ts`.
export type BatchDTO = {
  id: string;
  userId: string;
  name: string;
  category: BrewCategory;
  /**
   * Optional mead subtype enum string; only set when `category === "MEAD"`.
   * Kept as a plain string here so the type remains compatible even if
   * Prisma client hasn't been regenerated yet.
   */
  meadSubtype: string | null;
  status: BatchStatus;
  currentStage: BatchStage;
  startDate: string;
  brewDate: string | null;
  completedDate: string | null;
  targetVolume: string | null;
  actualVolume: string | null;
  originalGravity: string | null;
  finalGravity: string | null;
  calculatedABV: string | null;
  thumbnailImageUrl: string | null;
  isFavorite: boolean;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

/** One ingredient line when creating a batch (no batchId; applied server-side). */
export type CreateBatchAdditionPayload = {
  ingredientId?: string | null;
  customIngredientName?: string | null;
  amount: number;
  unit: string;
  purpose?: string | null;
  notes?: string | null;
};

// type for creating a new batch
// this is the input for creating a new batch on the create batch page
export type CreateBatchInput = {
  // required fields
  name: string;
  category: BrewCategory;
  // optional fields
  meadSubtype?: string | null;
  thumbnailImageUrl?: string | null;
  startDate?: string;
  targetVolume?: number | null;
  actualVolume?: number | null;
  status?: BatchStatus;
  currentStage?: BatchStage;
  brewDate?: string | null;
  originalGravity?: number | null;
  notes?: string | null;
  additions?: CreateBatchAdditionPayload[];
};

// type for updating a batch
// this is the input for updating a batch on the dashboard page
export type UpdateBatchInput = {
  name?: string;
  category?: BrewCategory;
  meadSubtype?: string | null;
  thumbnailImageUrl?: string | null;
  startDate?: string;
  targetVolume?: number | null;
  status?: BatchStatus;
  currentStage?: BatchStage;
  brewDate?: string | null;
  completedDate?: string | null;
  actualVolume?: number | null;
  originalGravity?: number | null;
  finalGravity?: number | null;
  notes?: string | null;
};

// type returned by prisma for the dashboard list query (scalar fields only).
export type DashboardBatchListRow = {
  id: string;
  name: string;
  category: BrewCategory;
  status: BatchStatus;
  currentStage: BatchStage;
  createdAt: Date;
  updatedAt: Date;
  originalGravity: Prisma.Decimal | null;
  finalGravity: Prisma.Decimal | null;
};
