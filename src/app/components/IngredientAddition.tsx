"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { IngredientDTO } from "@/src/types/ingredient";
import type { IngredientTypeGroup } from "@/src/lib/ingredientCatalog";
import type { AdditionRow } from "./CreateBatch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/app/components/ui/popover";
import { Button } from "@/src/app/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/src/app/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Separator } from "@/src/app/components/ui/separator";

const CUSTOM_VALUE = "__custom__";

type Props = {
  row: AdditionRow;
  ingredients: IngredientDTO[];
  groupedCatalog: IngredientTypeGroup[];
  onSelectIngredient: (rowId: string, value: string) => void;
};

export default function IngredientAddition({
  row,
  ingredients,
  groupedCatalog,
  onSelectIngredient,
}: Props) {
  const [open, setOpen] = useState(false);

  const triggerLabel = useMemo(() => {
    if (!row.selectValue) return "— Select —";
    if (row.selectValue === CUSTOM_VALUE) return "Custom name…";
    const ing = ingredients.find((i) => i.id === row.selectValue);
    if (!ing) return "— Select —";
    return ing.brand ? `${ing.name} (${ing.brand})` : ing.name;
  }, [row.selectValue, ingredients]);

  const pick = (value: string) => {
    onSelectIngredient(row.id, value);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <button
          type="button"
          className={cn(
            "auth-input-style flex w-full cursor-pointer items-center justify-between gap-2 text-left text-sm",
            !row.selectValue && "text-gray-600"
          )}
        >
          <span className="min-w-0 truncate">{triggerLabel}</span>
          <ChevronDown className="size-4 shrink-0 opacity-60" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-max-[300%] p-2 bg-antique-white-100/80 backdrop-blur-sm border-2 border-antique-white-500 shadow-md" align="start">
        <div className="max-h-72 overflow-y-auto overflow-x-hidden">
          <div className="flex flex-col gap-0.5">
            <Button
              type="button"
              variant="ghost"
              className="h-9 w-full justify-start px-3 text-sm font-normal text-muted-foreground"
              onClick={() => pick("")}
            >
              — Clear —
            </Button>
            {groupedCatalog.map(({ typeKey, label, items }) => (
              <Collapsible
                key={typeKey}
                defaultOpen={items.some((i) => i.id === row.selectValue)}
              >
                <CollapsibleTrigger className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left bg-antique-white-200/80 shadow-md text-sm font-semibold text-gray-800 outline-none hover:bg-antique-white-300/75">
                  <span className="min-w-0 flex-1">{label}</span>
                  <span className="tabular-nums text-xs font-normal text-gray-600">
                    {items.length}
                  </span>
                </CollapsibleTrigger>
                <CollapsibleContent className="flex flex-col gap-px py-px pl-2">
                  {items.map((ing) => (
                    <div key={ing.id}>
                    <Button
                      key={ing.id}
                      type="button"
                      variant="ghost"
                      className={cn(
                        "h-auto min-h-9 w-full justify-start px-3 py-1 my-1 text-left text-sm font-normal hover:bg-antique-white-200/75",
                        ing.id === row.selectValue &&
                          "font-medium"
                      )}
                      onClick={() => pick(ing.id)}
                    >
                      <span className="min-w-0 ">
                        {ing.name}
                        {ing.brand ? (
                          <span className="text-gray-600"> ({ing.brand})</span>
                        ) : null}
                      </span>
                    </Button>
                    <Separator className="bg-antique-white-500" />
                    </div>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ))}
            <Button
              type="button"
              variant="ghost"
              className="h-auto min-h-9 w-full justify-start px-3 py-1 my-1 text-sm font-normal hover:bg-antique-white-200/75"
              onClick={() => pick(CUSTOM_VALUE)}
            >
              Custom name…
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
