"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/src/app/components/ui/button";
import type { IngredientDTO } from "@/src/types/ingredient";
import type { IngredientTypeGroup } from "@/src/lib/ingredientCatalog";
import type { AdditionRow } from "./CreateBatch";
import IngredientAddition from "./IngredientAddition";
import SortToggle from "./buttons/SortToggle";

const CUSTOM_VALUE = "__custom__";

export type IngredientLinesSectionProps = {
  title: string;
  description: ReactNode;
  emptyMessage: ReactNode;
  rows: AdditionRow[];
  ingredients: IngredientDTO[];
  groupedCatalog: IngredientTypeGroup[];
  onSelectIngredient: (rowId: string, value: string) => void;
  setRows: Dispatch<SetStateAction<AdditionRow[]>>;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  sort?: "newest" | "oldest";
  setSort?: (sort: "newest" | "oldest") => void;
  customNamePlaceholder?: string;
  unitPlaceholder?: string;
};

export default function IngredientLinesSection({
  title,
  description,
  emptyMessage,
  rows,
  ingredients,
  groupedCatalog,
  onSelectIngredient,
  setRows,
  onAddRow,
  onRemoveRow,
  sort,
  setSort,
  customNamePlaceholder = "e.g. Potassium sorbate",
  unitPlaceholder = "tsp, g, oz…",
}: IngredientLinesSectionProps) {
  const showSort = sort !== undefined && setSort !== undefined;

  return (
    <section className="rounded-lg border border-antique-white-600 bg-antique-white-200/40 p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="heading-style text-lg font-bold text-gray-900">{title}</h2>
          <p className="mb-3 text-style text-sm text-gray-600">{description}</p>
        </div>
        <div className="flex gap-2">
          {showSort ? <SortToggle sort={sort} setSort={setSort} /> : null}
          <Button
            type="button"
            className="button-style shadow-style save-button"
            onClick={onAddRow}
          >
            <Plus className="size-4" />
            Add ingredient
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="text-style text-sm text-gray-600">{emptyMessage}</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {rows.map((row) => (
            <li
              key={row.id}
              className="rounded-md border border-antique-white-500 bg-antique-white-100/80 p-3"
            >
              <div className="flex w-full gap-4">
                <label className="flex w-full min-w-0 flex-col gap-1">
                  <span className="text-sm font-semibold tracking-wide text-gray-700">
                    Ingredient
                  </span>
                  <IngredientAddition
                    row={row}
                    ingredients={ingredients}
                    groupedCatalog={groupedCatalog}
                    onSelectIngredient={onSelectIngredient}
                  />
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-lg text-red-800 button-style hover:bg-red-200"
                  onClick={() => onRemoveRow(row.id)}
                  aria-label="Remove row"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              {row.selectValue === CUSTOM_VALUE ? (
                <label className="mt-2 flex flex-col gap-1">
                  <span className="text-sm font-semibold text-gray-700">
                    Custom name
                  </span>
                  <input
                    className="auth-input-style w-full text-sm"
                    value={row.customName}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r) =>
                          r.id === row.id
                            ? { ...r, customName: e.target.value }
                            : r
                        )
                      )
                    }
                    placeholder={customNamePlaceholder}
                  />
                </label>
              ) : null}
              <div className="mt-2 flex w-full gap-4">
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-gray-700">
                    Amount
                  </span>
                  <input
                    className="auth-input-style w-full text-sm"
                    inputMode="decimal"
                    value={row.amount}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r) =>
                          r.id === row.id
                            ? { ...r, amount: e.target.value }
                            : r
                        )
                      )
                    }
                  />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-gray-700">
                    Unit
                  </span>
                  <input
                    className="auth-input-style w-full text-sm"
                    value={row.unit}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r) =>
                          r.id === row.id
                            ? { ...r, unit: e.target.value }
                            : r
                        )
                      )
                    }
                    placeholder={unitPlaceholder}
                  />
                </label>
              </div>
              <label className="mt-2 flex flex-col gap-1">
                <span className="text-sm font-semibold text-gray-700">
                  Line notes <span className="font-normal">(optional)</span>
                </span>
                <input
                  className="auth-input-style w-full text-sm"
                  value={row.notes}
                  onChange={(e) =>
                    setRows((prev) =>
                      prev.map((r) =>
                        r.id === row.id ? { ...r, notes: e.target.value } : r
                      )
                    )
                  }
                />
              </label>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
