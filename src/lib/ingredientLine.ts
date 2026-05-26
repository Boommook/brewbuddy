import { BatchStage } from "../generated/prisma/index.js";
import { isBatchStage } from "./batchStages";
import type { IngredientLineInput } from "../types/ingredientLine";

export function normalizeIngredientLineInputs(
  raw: IngredientLineInput[] | undefined,
  defaultStage: BatchStage = BatchStage.PRIMARY
): IngredientLineInput[] {
  if (!raw?.length) {
    return [];
  }

  const lines: IngredientLineInput[] = [];

  for (const line of raw) {
    const unit = typeof line.unit === "string" ? line.unit.trim() : "";
    const customIngredientName =
      typeof line.customIngredientName === "string"
        ? line.customIngredientName.trim()
        : "";
    const hasIngredient =
      typeof line.ingredientId === "string" && line.ingredientId.length > 0;
    const amount = Number(line.amount);

    if (!hasIngredient && !customIngredientName) {
      continue;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Each ingredient line needs a positive amount");
    }
    if (!unit) {
      throw new Error("Each ingredient line needs a unit");
    }
    if (hasIngredient && customIngredientName) {
      throw new Error("Use either a catalog ingredient or a custom name, not both");
    }

    let stageAdded = defaultStage;
    if (typeof line.stageAdded === "string" && line.stageAdded.length > 0) {
      if (!isBatchStage(line.stageAdded)) {
        throw new Error("Invalid fermentation stage on ingredient line");
      }
      stageAdded = line.stageAdded;
    }

    lines.push({
      ingredientId: hasIngredient ? line.ingredientId : null,
      customIngredientName: customIngredientName || null,
      amount,
      unit,
      stageAdded,
      notes:
        typeof line.notes === "string" && line.notes.trim()
          ? line.notes.trim()
          : null,
    });
  }

  return lines;
}
