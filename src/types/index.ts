/**
 * Brewing Buddy – shared types for batches, checks, and related data.
 * Tolerates partial/incomplete check-up inputs per requirements.
 */

export type BatchStatus = "active" | "archived" | "completed";
export type BatchType = "mead" | "wine" | "cider" | "other";
export type BatchSubtype = "melomel" | "honey" | "tea" | "other";
export type BatchStage = "Primary Fermentation" | "Secondary Fermentation" | "Aging" | "Completed";

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

export interface Ingredient {
  id: string;
  name: string;
  amount?: string;
  unit?: string;
  addedAt?: string; // ISO date
  removedAt?: string; // ISO date, for removals during checks
}

export interface Equipment {
  id: string;
  name: string;
  usedAt?: string; // ISO date
}

export interface GravityReading {
  value: number; // e.g. 1.050
  date: string;   // ISO date
  note?: string;
}

export interface BatchCheck {
  id: string;
  batchId: string;
  date: string;           // ISO date
  specificGravity?: number;
  ingredientsAdded?: Ingredient[];
  ingredientsRemoved?: string[]; // ids or names
  equipmentUsed?: Equipment[];
  notes?: string;
}

export interface Batch {
  id: string;
  label: string;
  photoUrl?: string;
  status: BatchStatus;
  /** Starting specific gravity (e.g. 1.050) */
  startingGravity: number;
  /** Ingredients at batch creation */
  ingredients: Ingredient[];
  /** Equipment used for this batch */
  equipment: Equipment[];
  /** All gravity readings over time */
  gravityReadings: GravityReading[];
  /** All recorded check-ups */
  checks: BatchCheck[];
  /** Next check due (ISO date); user can override */
  nextCheckDue: string;
  /** Check interval in days; used to calculate next check */
  checkIntervalDays: number;
  createdAt: string;
  updatedAt: string;
}

/** Input when creating a new batch */
export type CreateBatchInput = Pick<Batch, "label" | "startingGravity" | "ingredients" | "equipment"> & {
  photo?: File | string;
  checkIntervalDays?: number;
};

/** Input for a single check-up (all fields optional for partial inputs) */
export type CheckInput = Partial<{
  specificGravity: number;
  ingredientsAdded: Ingredient[];
  ingredientsRemoved: string[];
  equipmentUsed: Equipment[];
  notes: string;
}>;
