"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/src/app/components/ui/button";
import type { IngredientDTO } from "@/src/types/ingredient";
import { Input } from "@/src/app/components/ui/input";
import { BREW_CATEGORIES, MEAD_SUBCATEGORIES, type BrewCategory, type MeadSubcategory } from "@/src/types/batch_types";
import BackButton from "./buttons/BackButton";
import { groupIngredientsByType } from "@/src/lib/ingredientCatalog";
import IngredientLinesSection from "./IngredientLinesSection";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import {
  type IngredientLineRow,
  ingredientLineInputsFromRows,
  ingredientLineRowFromDTO,
  newIngredientLineRow,
} from "@/src/types/ingredientLines";
import RecipeSelect from "./RecipeSelect";
import type { RecipeDTO } from "@/src/types/recipe";

export type AdditionRow = IngredientLineRow;

const CUSTOM_VALUE = "__custom__";

function mergeRecipeIngredientsIntoCatalog(
  catalog: IngredientDTO[],
  recipeIngredients: RecipeDTO["ingredients"]
) {
  const merged = new Map(
    catalog.map((ingredient) => [ingredient.id, ingredient])
  );

  for (const recipeIngredient of recipeIngredients) {
    if (recipeIngredient.ingredient) {
      merged.set(recipeIngredient.ingredient.id, recipeIngredient.ingredient);
    }
  }
  return Array.from(merged.values());
}

function mergeIngredientCatalogs(
  primary: IngredientDTO[],
  secondary: IngredientDTO[]
) {
  return Array.from(
    new Map([...primary, ...secondary].map((ingredient) => [ingredient.id, ingredient])).values()
  );
}

type CreateBatchProps = {
  initialRecipeId?: string;
};

export default function CreateBatch({ initialRecipeId }: CreateBatchProps = {}) {
  const router = useRouter();
  // state for the ingredients. this is an array of ingredient DTOs
  const [ingredients, setIngredients] = useState<IngredientDTO[]>([]);
  const [rows, setRows] = useState<AdditionRow[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [name, setName] = useState("");
  // state for the brew category. this uses the BrewCategory type to ensure the value is valid (to avoid a random string being set)
  const [category, setCategory] = useState<BrewCategory>("MEAD");
  // state for the mead subtype. this uses the MeadSubcategory type to ensure the value is valid (to avoid a random string being set)
  const [meadSubtype, setMeadSubtype] = useState<MeadSubcategory | null>(null);
  const [startDate, setStartDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [brewDate, setBrewDate] = useState("");
  const [targetVolume, setTargetVolume] = useState("");
  const [originalGravity, setOriginalGravity] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [creationMethod, setCreationMethod] = useState<"manual" | "recipe">(
    initialRecipeId ? "recipe" : "manual"
  );
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeDTO | null>(null);
  const [importingRecipe, setImportingRecipe] = useState(false);
  // state for the cover image url. this is the url of the cover image (used to actually display the cover image)
  // the image is actually stored in the vercel blob storage
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);

  
  /*
    function called when the cover image is changed
    1. it sends the cover image file to the server
    2. it uses the url from the server to set the cover image url state
  */
  const handleCoverImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    // get the file from the input by getting the first file from the files array
    const file = e.target.files?.[0] ?? null; // if no file is selected, set the cover image to null

    // check if file is null, if so...
    if (!file) {
      // set the cover image to null and the cover image url to null and return
      setCoverImageUrl(null);
      return;
    }

    // create a new form data object to send the file to the server
    const formData = new FormData(); // docs: https://developer.mozilla.org/en-US/docs/Web/API/FormData
    // append the file to the form data
    formData.append("file", file);

    try {
      // send the file to the server
      const res = await fetch("/api/uploads/cover-image", {
        method: "POST",
        body: formData,
      });

      // get the response
      const data = await res.json();
      // error checking for invalid response
      if (!res.ok || !data?.ok || typeof data.url !== "string") {
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : "Failed to upload cover image"
        );
      }

      // if the response is ok, set the cover image url to the url from the response
      setCoverImageUrl(data.url);
    } 
    // if an error occurs, set the form error and set the cover image and cover image url to null
    catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Failed to upload cover image"
      );
      setCoverImageUrl(null);
    }
  };

  const applyRecipeImport = useCallback((recipe: RecipeDTO) => {
    setSelectedRecipe(recipe);
    setCategory(recipe.category ?? "MEAD");
    setMeadSubtype(recipe.category === "MEAD" ? recipe.meadSubtype ?? null : null);
    setTargetVolume(String(recipe.targetVolume));
    setRows(recipe.ingredients.map(ingredientLineRowFromDTO));
    setIngredients((current) =>
      mergeRecipeIngredientsIntoCatalog(current, recipe.ingredients)
    );
    setSort("oldest");

    if (recipe.ingredients.length === 0) {
      setFormError(
        "This recipe has no saved ingredients yet. Add them on the recipe page, or enter ingredients manually below."
      );
    }
  }, []);

  const importRecipeById = useCallback(
    async (recipeId: string) => {
      setFormError(null);
      setImportingRecipe(true);
      try {
        const res = await fetch(`/api/recipes/${recipeId}`);
        const data = (await res.json()) as {
          ok?: boolean;
          recipe?: RecipeDTO;
          error?: string;
        };
        if (!res.ok || !data.ok || !data.recipe) {
          throw new Error(
            typeof data.error === "string"
              ? data.error
              : "Could not load recipe ingredients"
          );
        }
        applyRecipeImport(data.recipe);
      } catch (error) {
        setFormError(
          error instanceof Error
            ? error.message
            : "Could not import recipe ingredients"
        );
      } finally {
        setImportingRecipe(false);
      }
    },
    [applyRecipeImport]
  );

  const handleRecipeSelect = useCallback(
    async (recipe: RecipeDTO) => {
      setSelectedRecipe(recipe);
      await importRecipeById(recipe.id);
    },
    [importRecipeById]
  );

  useEffect(() => {
    if (!initialRecipeId) return;
    void importRecipeById(initialRecipeId);
  }, [initialRecipeId, importRecipeById]);

  useEffect(() => {
    if (creationMethod !== "recipe" || !selectedRecipe?.ingredients.length) {
      return;
    }
    setIngredients((current) =>
      mergeRecipeIngredientsIntoCatalog(current, selectedRecipe.ingredients)
    );
  }, [creationMethod, ingredients.length, selectedRecipe]);

 
/*
  useEffect hook to load the ingredient catalog when the component mounts (on page load)
  1. it fetches the ingredient catalog from the server
  2. it sets the ingredients state to the ingredient catalog
  3. if an error occurs, it sets the catalog error state to the error message
  */
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
            setIngredients((current) => mergeIngredientCatalogs(data.ingredients, current));
        }
    } catch (error) {
        if (!cancelled) {
            setCatalogError(
                error instanceof Error ? error.message : "Could not load ingredients"
            );
        }
    }
    })();
    return () => {
        cancelled = true;
    };
}, []);

/*
function called when an ingredient is selected from the catalog
*/
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

  const handleSubmit = async (e: React.SubmitEvent) => {
    // prevent the default form submission behavior
    e.preventDefault();
    // clear the form error
    setFormError(null);
    // ensure the batch name is not empty
    if (!name.trim()) {
      setFormError("Give your batch a name.");
      return;
    }

    let additions;
    try {
      additions = ingredientLineInputsFromRows(rows);
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
      category,
      startDate: new Date(startDate + "T12:00:00").toISOString(),
      notes: notes.trim() || null,
    };

    if (category === "MEAD" && meadSubtype) {
      payload.meadSubtype = meadSubtype;
    }

    if (brewDate) {
      payload.brewDate = new Date(brewDate + "T12:00:00").toISOString();
    }
    if (targetVolume.trim()) {
      const v = Number(targetVolume);
      if (Number.isFinite(v) && v > 0) payload.targetVolume = v;
    }
    if (originalGravity.trim()) {
      const og = Number(originalGravity);
      if (Number.isFinite(og) && og > 0) payload.originalGravity = og;
    }
    if (additions.length) payload.additions = additions;
    if (coverImageUrl) payload.thumbnailImageUrl = coverImageUrl;

    setSubmitting(true);
    try {
      const res = await fetch("/api/batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(typeof data.error === "string" ? data.error : "Failed to create batch");
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="md:my-8 md:mx-[20vw] md:rounded-xl md:border-2 border-harvest-orange-700 bg-camel/75 px-8 py-6 shadow-lg shadow-black/20 backdrop-blur-xs">
      <div >
        <div className="mb-6 flex gap-4">
          <div className="flex mt-2">
            <BackButton  />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="zilla-slab-bold text-3xl text-gray-900">
              Create a batch
            </h1>
            <p>
              Select a method to create your batch:
            </p>
            <div className="flex flex-row gap-2">
              <Button variant="outline" className={`${creationMethod === "manual" ? "option-button-active" : "option-button"}`} onClick={() => setCreationMethod("manual")}>
                Manual
              </Button>
              <Button variant="outline" className={`${creationMethod === "recipe" ? "option-button-active" : "option-button"}`} onClick={() => setCreationMethod("recipe")}>
                Import from Recipe
              </Button>
            </div>
            <p className="nunito-sans-regular text-gray-700">
              Log the basics now; you can add fermentation events and readings later.
            </p>
          </div>
        </div>

        {creationMethod === "recipe" && (
          <RecipeSelect
            setSelectedRecipe={handleRecipeSelect}
            selectedRecipe={selectedRecipe}
            importing={importingRecipe}
          />
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {catalogError && (
            <p className="rounded-md border border-amber-700/50 bg-amber-100/80 px-3 py-2 text-sm text-amber-950">
              {catalogError} — you can still enter custom ingredients below.
            </p>
          )}
          {formError && (
            <p className="rounded-md border border-red-700/40 bg-red-100/80 px-3 py-2 text-sm text-red-950">
              {formError}
            </p>
          )}

          <div className="grid gap-4 grid-cols-2">
            <label className="flex flex-col gap-1 col-span-2">
              <span className="text-sm font-semibold text-gray-800">
                Batch name
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
              {creationMethod === "manual" ? (  
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
              ) : (
                <div className="auto-field-fill-style w-full">{selectedRecipe?.category}</div>
              )}
            </label>

            {category === "MEAD" && selectedRecipe?.meadSubtype ? (
              <label className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-gray-800">
                  Mead subtype <span className="font-normal text-gray-600">(optional)</span>
                </span>
                {creationMethod === "manual" ? (
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
                ) : (
                    <div className="auto-field-fill-style w-full">{selectedRecipe?.meadSubtype}</div>
                )}
              </label>
            ) : <div className="col-span-1"></div>}

            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-gray-800">
                Start date
              </span>
              <input
                type="date"
                className="auth-input-style w-full"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-gray-800">
                Brew day <span className="font-normal text-gray-600">(optional)</span>
              </span>
              <input
                type="date"
                className="auth-input-style w-full"
                value={brewDate}
                onChange={(e) => setBrewDate(e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-gray-800">
                Target volume (gallons) <span className="font-normal text-gray-600">(optional)</span>
              </span>
              {creationMethod === "manual" ? (
                <input
                  className="auth-input-style w-full"
                  inputMode="decimal"
                  value={targetVolume}
                  onChange={(e) => setTargetVolume(e.target.value)}
                  placeholder="e.g. 3"
                />
              ) : (
                <div className="auto-field-fill-style w-full">{selectedRecipe?.targetVolume} gallons</div>
              )}
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-gray-800">
                Original gravity <span className="font-normal text-gray-600">(optional)</span>
              </span>
              <input
                className="auth-input-style w-full"
                inputMode="decimal"
                value={originalGravity}
                onChange={(e) => setOriginalGravity(e.target.value)}
                placeholder="e.g. 1.100"
              />
            </label>
          </div>

          <div className="flex flex-col gap-1 items-center">
            <span className="text-sm font-semibold text-gray-800">
              Cover image
            </span>
            {coverImageUrl && (
              <img
                src={coverImageUrl}
                alt="Cover image"
                className="w-[50%] border-2 border-antique-white-600 rounded-md"
              />
            )}
            <Input
              type="file"
              className="bg-gray-100 shadow-md hover:bg-gray-300 rounded-md border-2 hover:cursor-pointer border-gray-500 w-fit h-fit"
              accept="image/*"
              onChange={(e) => handleCoverImageChange(e)}
              placeholder="e.g. cover-image.jpg"
              autoComplete="off"
            />
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-gray-800">Notes</span>
            <textarea
              className="auth-input-style min-h-[100px] w-full resize-y"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Recipe ideas, yeast choice, etc."
            />
          </label>

          <IngredientLinesSection
            title="Starting ingredients"
            description="Add the ingredients you're using to start your batch."
            emptyMessage={
              <>
                Optional: add honey, fruit, water, yeast, or anything else you already
                know. Lines left blank are ignored.
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
                  className={`${name !== "" && rows.length > 0 ? "save-button" : "button-style hover:cursor-not-allowed! shadow-style bg-gray-400 scale-none! border-2 border-gray-600  text-antique-white-100"}`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Creating…
                    </>
                  ) : (
                    "Create batch"
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {name !== "" && rows.length > 0 ? <p>Create a new batch</p> : <p>Complete the required fields to create a new batch</p>}
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
