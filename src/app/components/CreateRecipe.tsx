"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "./ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { Loader2 } from "lucide-react";
import BackButton from "./buttons/BackButton";
import { VolumeUnit } from "@/src/generated/prisma/index.js";
import IngredientLinesSection from "./IngredientLinesSection";
import { BREW_CATEGORIES, MEAD_SUBCATEGORIES, type BrewCategory, type MeadSubcategory } from "@/src/types/batch_types";
import type { IngredientDTO } from "@/src/types/ingredient";
import {
  type IngredientLineRow,
  ingredientLineInputsFromRows,
  newIngredientLineRow,
} from "@/src/types/ingredientLines";
import { groupIngredientsByType } from "@/src/lib/ingredientCatalog";

const CUSTOM_VALUE = "__custom__";

export default function CreateRecipe() {
    const [formError, setFormError] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<BrewCategory>("MEAD");
    const [meadSubtype, setMeadSubtype] = useState<MeadSubcategory | null>(null);
    const [ingredients, setIngredients] = useState<IngredientDTO[]>([]);
    const [rows, setRows] = useState<IngredientLineRow[]>([]);
    const [sort, setSort] = useState<"newest" | "oldest">("newest");

    const [targetVolume, setTargetVolume] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
      // create a cancelled variable to track if the effect has been cancelled
      let cancelled = false;
      // async function to fetch the ingredients
      (async () => {
      try {
          // fetch the ingredients
          const res = await fetch("/api/ingredients");
          // ensure the response is ok
          if (!res.ok) {
              throw new Error("Could not load ingredient catalog");
          }
          // get the data from the response
          const data = await res.json();
          // ensure the data is ok and is an array
          if (!cancelled && data.ok && Array.isArray(data.ingredients)) {
              // set the ingredients state to the ingredient catalog
              setIngredients(data.ingredients);
          }
      } catch {
          if (!cancelled) {
              /*setCatalogError(
                  e instanceof Error ? e.message : "Could not load ingredients"
              );*/
          }
      }
      })();
      return () => {
          cancelled = true;
      };
  }, []);

  const addRow = () => setRows((r) => [...r, newIngredientLineRow("PRIMARY")]);
  const removeRow = (id: string) =>
      setRows((r) => r.filter((x) => x.id !== id));

  const groupedCatalog = useMemo(
    () => groupIngredientsByType(ingredients),
    [ingredients]
  );

  const sortedRows = useMemo(() => {
    if (sort === "newest") return [...rows].reverse();
    return [...rows];
  }, [rows, sort]);

  const onSelectIngredient = useCallback((rowId: string, value: string) => {
    setRows((prev) =>
    prev.map((r) => {
        if (r.id !== rowId) return r;
        if (value === CUSTOM_VALUE) {
            return {
                ...r,
                selectValue: CUSTOM_VALUE,
                customName: r.customName ?? "",
                unit: r.unit,
            };
        }
        if (!value) {
            return { ...r, selectValue: "", unit: "", customName: "" };
        }
        const ing = ingredients.find((i) => i.id === value);
        return {
            ...r,
            selectValue: value,
            customName: "",
            unit: ing?.defaultUnit ?? r.unit,
        };
    })
    );
}, [ingredients]);

  const handleSubmit = async (e: React.SubmitEvent) => {
      e.preventDefault();
      setFormError(null);
      if (!name.trim()) {
          setFormError("Give your recipe a name.");
          return;
      }
      const parsedTargetVolume = Number(targetVolume);
      if (!Number.isFinite(parsedTargetVolume) || parsedTargetVolume <= 0) {
        setFormError("Give your recipe a positive target volume.");
        return;
      }

      let ingredientsPayload;
      try {
        ingredientsPayload = ingredientLineInputsFromRows(rows);
      } catch (error) {
        setFormError(
          error instanceof Error
            ? error.message
            : "Each ingredient line needs a positive amount and a unit."
        );
        return;
      }
      
      const payload: Record<string, unknown> = {
          name: name.trim(),
          description: description.trim() || null,
          category: category,
          meadSubtype: category === "MEAD" ? meadSubtype || null : null,
          targetVolume: parsedTargetVolume,
          targetVolumeUnit: VolumeUnit.GAL,
          ingredients: ingredientsPayload,
      }

      setSubmitting(true);
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Failed to create recipe");
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }   
  }

    

    return (
        <div className="my-8 mx-[20vw] rounded-xl border-2 border-harvest-orange-700 bg-camel/75 px-8 py-6 shadow-lg shadow-black/20 backdrop-blur-xs">
          <div >
            <div className="mb-6 flex gap-4">
              <div className="flex mt-2">
                <BackButton  />
              </div>
              <div className="flex flex-col gap-2">
                <h1 className="zilla-slab-bold text-3xl text-gray-900">
                  New recipe
                </h1>
                <p className="nunito-sans-regular text-gray-700">
                  Log the basics now; you can add fermentation events and readings later.
                </p>
              </div>
            </div>
    
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {formError && (
                <p className="rounded-md border border-red-700/40 bg-red-100/80 px-3 py-2 text-sm text-red-950">
                  {formError}
                </p>
              )}
    
              <div className="grid gap-4 grid-cols-2">
                <label className="flex flex-col gap-1 col-span-2">
                  <span className="text-sm font-semibold text-gray-800">
                    Recipe name
                  </span>
                  <input
                    className="auth-input-style w-full"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Spring blueberry melomel"
                    autoComplete="off"
                  />
                </label>
    
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-gray-800">
                    Category
                  </span>
                  <select
                    className="auth-input-style w-full"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as BrewCategory)}
                  >
                    {BREW_CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </label>
    
                {category === "MEAD" ? (
                  <label className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-gray-800">
                      Mead subtype <span className="font-normal text-gray-600">(optional)</span>
                    </span>
                    <select
                      className="auth-input-style w-full"
                      value={meadSubtype ?? ""}
                      onChange={(e) => setMeadSubtype(e.target.value as MeadSubcategory)}
                    >
                      <option value="">— Select subtype —</option>
                      {MEAD_SUBCATEGORIES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : <div className="col-span-1"></div>}
    
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-gray-800">
                    Target volume (gallons)
                  </span>
                  <input
                    className="auth-input-style w-full"
                    inputMode="decimal"
                    value={targetVolume}
                    onChange={(e) => setTargetVolume(e.target.value)}
                    placeholder="e.g. 3"
                  />
                </label>
              </div>
    
    
              <label className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-gray-800">Description</span>
                <textarea
                  className="auth-input-style min-h-[100px] w-full resize-y"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. This recipe is for 1 gallon of traditional mead."
                />
              </label>
    
              <IngredientLinesSection
                title="Ingredients"
                description="Add the ingredients that you're recipe requires."
                emptyMessage={
                  <>
                    Optional: add honey, fruit, water, yeast, or anything else you already know. Lines left blank are ignored.
                  </>
                }
                rows={sortedRows}
                ingredients={ingredients}
                groupedCatalog={groupedCatalog}
                onSelectIngredient={onSelectIngredient}
                setRows={setRows}
                onAddRow={addRow}
                onRemoveRow={removeRow}
                sort={sort}
                setSort={setSort}
                customNamePlaceholder="e.g. Local wildflower honey"
                unitPlaceholder="lb, gal, g…"
              />
    
              <div className="flex flex-wrap gap-3">
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      type="submit"
                      disabled={submitting}
                      className={`${name !== "" ? "save-button" : "button-style hover:cursor-not-allowed! shadow-style bg-gray-400 scale-none! border-2 border-gray-600  text-antique-white-100"}`}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Creating…
                        </>
                      ) : (
                        "Create recipe"
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {name !== "" ? <p>Create a new recipe</p> : <p>Complete the required fields to create a new recipe</p>}
                  </TooltipContent>
                </Tooltip>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/")}
                  disabled={submitting}
                  className="cancel-button button-style shadow-style"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      );
    }
    