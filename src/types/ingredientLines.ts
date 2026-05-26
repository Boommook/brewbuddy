import type { BatchStage } from "../generated/prisma/index.js";
import type { IngredientLineDTO, IngredientLineInput } from "./ingredientLine";

const CUSTOM_VALUE = "__custom__";

/** Client-side ingredient line while creating a batch, recipe, or log entry. */
export type IngredientLineRow = {
  id: string;
  selectValue: string;
  customName: string;
  amount: string;
  unit: string;
  notes: string;
  stageAdded: BatchStage;
};

export function newIngredientLineRow(
  stageAdded: BatchStage = "PRIMARY"
): IngredientLineRow {
  return {
    id: crypto.randomUUID(),
    selectValue: "",
    customName: "",
    amount: "",
    unit: "",
    notes: "",
    stageAdded,
  };
}

export function ingredientLineInputFromRow(
  row: IngredientLineRow
): IngredientLineInput | null {
  const isCustom = row.selectValue === CUSTOM_VALUE;
  const ingredientId = !isCustom && row.selectValue ? row.selectValue : null;
  const customIngredientName = isCustom ? row.customName.trim() : "";

  if (!ingredientId && !customIngredientName) {
    return null;
  }

  const amount = Number(row.amount);
  const unit = row.unit.trim();
  if (!Number.isFinite(amount) || amount <= 0 || !unit) {
    throw new Error("Each ingredient line needs a positive amount and a unit.");
  }

  return {
    ingredientId,
    customIngredientName: isCustom ? customIngredientName : null,
    amount,
    unit,
    stageAdded: row.stageAdded,
    notes: row.notes.trim() || null,
  };
}

export function ingredientLineInputsFromRows(
  rows: IngredientLineRow[]
): IngredientLineInput[] {
  const inputs: IngredientLineInput[] = [];

  for (const row of rows) {
    const input = ingredientLineInputFromRow(row);
    if (input) {
      inputs.push(input);
    }
  }

  return inputs;
}

export function ingredientLineRowFromDTO(
  line: Pick<
    IngredientLineDTO,
    | "ingredientId"
    | "customIngredientName"
    | "amount"
    | "unit"
    | "stageAdded"
    | "notes"
  >
): IngredientLineRow {
  const isCustom = !line.ingredientId && !!line.customIngredientName;

  return {
    id: crypto.randomUUID(),
    selectValue: isCustom ? CUSTOM_VALUE : line.ingredientId ?? "",
    customName: line.customIngredientName ?? "",
    amount: String(line.amount),
    unit: line.unit,
    notes: line.notes ?? "",
    stageAdded: line.stageAdded,
  };
}
