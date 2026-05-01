import type { IngredientDTO } from "@/src/types/ingredient";

export function formatIngredientTypeLabel(type: string): string {
  return type
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export type IngredientTypeGroup = {
  typeKey: string;
  label: string;
  items: IngredientDTO[];
};

export function groupIngredientsByType(
  ingredients: IngredientDTO[]
): IngredientTypeGroup[] {
  const byType = new Map<string, IngredientDTO[]>();
  for (const ing of ingredients) {
    const key = ing.ingredientType;
    const list = byType.get(key);
    if (list) list.push(ing);
    else byType.set(key, [ing]);
  }
  for (const list of byType.values()) {
    list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
  }
  return [...byType.entries()]
    .map(([typeKey, items]) => ({
      typeKey,
      label: formatIngredientTypeLabel(typeKey),
      items,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
}
