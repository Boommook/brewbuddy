import type {
  EventType,
  MeasurementType,
} from "../generated/prisma/index.js";

// addition line on a batch (json api shape).
export type BatchIngredientAdditionDTO = {
  id: string;
  batchId: string;
  ingredientId: string | null;
  customIngredientName: string | null;
  amount: string;
  unit: string;
  purpose: string | null;
  additionType: string | null;
  addedAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateBatchIngredientAdditionInput = {
  batchId: string;
  ingredientId?: string | null;
  customIngredientName?: string | null;
  amount: number;
  unit: string;
  purpose?: string | null;
  additionType?: string | null;
  addedAt?: string | null;
  notes?: string | null;
};

export type UpdateBatchIngredientAdditionInput = {
  ingredientId?: string | null;
  customIngredientName?: string | null;
  amount?: number;
  unit?: string;
  purpose?: string | null;
  additionType?: string | null;
  addedAt?: string | null;
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
