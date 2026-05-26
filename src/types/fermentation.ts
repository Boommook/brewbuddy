import type {
  BatchStage,
  EventType,
  MeasurementType,
} from "../generated/prisma/index.js";
import type { IngredientLineDTO, IngredientLineInput } from "./ingredientLine";

// addition line on a batch (json api shape).
export type BatchIngredientAdditionDTO = IngredientLineDTO & {
  batchId: string;
  purpose: string | null;
  additionType: string | null;
  addedAt: string | null;
};

export type CreateBatchIngredientAdditionInput = IngredientLineInput & {
  batchId: string;
  purpose?: string | null;
  additionType?: string | null;
  addedAt?: string | null;
};

export type UpdateBatchIngredientAdditionInput = {
  ingredientId?: string | null;
  customIngredientName?: string | null;
  amount?: number;
  unit?: string;
  purpose?: string | null;
  additionType?: string | null;
  addedAt?: string | null;
  stageAdded?: BatchStage;
  notes?: string | null;
};

export type BatchEventDTO = {
  id: string;
  batchId: string;
  eventType: EventType;
  title: string;
  description: string | null;
  occurredAt: string;
  createdAt: string;
};

export type CreateBatchEventInput = {
  batchId: string;
  eventType: EventType;
  title: string;
  description?: string | null;
  occurredAt: string;
};

export type BatchMeasurementDTO = {
  id: string;
  batchId: string;
  measurementType: MeasurementType;
  value: string;
  unit: string | null;
  measuredAt: string;
  note: string | null;
  createdAt: string;
};

export type CreateBatchMeasurementInput = {
  batchId: string;
  measurementType: MeasurementType;
  value: number;
  unit?: string | null;
  measuredAt: string;
  note?: string | null;
};
