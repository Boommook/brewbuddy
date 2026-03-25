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
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateBatchInput = {
  name: string;
  category: BrewCategory;
  // iso 8601; defaults to current instant server-side if omitted.
  startDate?: string;
  targetVolume?: number | null;
  actualVolume?: number | null;
  status?: BatchStatus;
  currentStage?: BatchStage;
  brewDate?: string | null;
  originalGravity?: number | null;
  notes?: string | null;
};

export type UpdateBatchInput = {
  name?: string;
  category?: BrewCategory;
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

// shape returned by prisma for the dashboard list query (scalar fields only).
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
