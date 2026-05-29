import { BREW_CATEGORIES, MEAD_SUBCATEGORIES } from "@/src/types/batch_types";

export function getBrewCategoryLabel(value: string | null | undefined) {
  if (!value) return "—";
  return BREW_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function getMeadSubtypeLabel(value: string | null | undefined) {
  if (!value) return null;
  return MEAD_SUBCATEGORIES.find((s) => s.value === value)?.label ?? value;
}

export function formatTargetVolume(
  volume: number,
  unit: string | null | undefined
) {
  const unitLabel =
    unit === "GAL" ? "gal" : unit === "L" ? "L" : (unit?.toLowerCase() ?? "");
  return `${volume} ${unitLabel}`.trim();
}
