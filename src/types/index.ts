// shared types: prisma-aligned dtos live in named modules; this file re-exports
// them and keeps ui / mock shapes separate from generated enums.

export type {
  BatchDTO,
  CreateBatchInput,
  CreateBatchAdditionPayload,
  UpdateBatchInput,
  DashboardBatchListRow,
} from "./batch";

export type {
  IngredientDTO,
  CreateIngredientInput,
  UpdateIngredientInput,
} from "./ingredient";

export type {
  BatchIngredientAdditionDTO,
  CreateBatchIngredientAdditionInput,
  UpdateBatchIngredientAdditionInput,
  BatchEventDTO,
  CreateBatchEventInput,
  BatchMeasurementDTO,
  CreateBatchMeasurementInput,
} from "./fermentation";

// --- ui & legacy mock shapes (not prisma models) ---

export type UiBatchLifecycleStatus = "active" | "archived" | "completed";
export type UiBatchKind = "mead" | "wine" | "cider" | "other";
export type UiBatchSubtype = "melomel" | "honey" | "tea" | "other";
export type UiFermentationStageLabel =
  | "Primary Fermentation"
  | "Secondary Fermentation"
  | "Aging"
  | "Completed";

export interface BatchCardProps {
  id: string;
  title: string;
  type: string;
  stage: string;
  image: string;
  abv: number;
  favourite: boolean;
  createdAt: Date;
  lastCheckedAt: Date;
  OG: number;
  FG: number;
}

export interface IngredientLine {
  id: string;
  name: string;
  amount?: string;
  unit?: string;
  addedAt?: string;
  removedAt?: string;
}

export interface Equipment {
  id: string;
  name: string;
  usedAt?: string;
}

export interface GravityReading {
  value: number;
  date: string;
  note?: string;
}

export interface BatchCheck {
  id: string;
  batchId: string;
  date: string;
  specificGravity?: number;
  ingredientsAdded?: IngredientLine[];
  ingredientsRemoved?: string[];
  equipmentUsed?: Equipment[];
  notes?: string;
}

// legacy rich mock shape for prototypes; prefer `BatchDTO` for API data.
export interface MockBatchDetail {
  id: string;
  label: string;
  photoUrl?: string;
  status: UiBatchLifecycleStatus;
  startingGravity: number;
  ingredients: IngredientLine[];
  equipment: Equipment[];
  gravityReadings: GravityReading[];
  checks: BatchCheck[];
  nextCheckDue: string;
  checkIntervalDays: number;
  createdAt: string;
  updatedAt: string;
}

export type MockBatchCreateInput = Pick<
  MockBatchDetail,
  "label" | "startingGravity" | "ingredients" | "equipment"
> & {
  photo?: File | string;
  checkIntervalDays?: number;
};

export type CheckInput = Partial<{
  specificGravity: number;
  ingredientsAdded: IngredientLine[];
  ingredientsRemoved: string[];
  equipmentUsed: Equipment[];
  notes: string;
}>;
