"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/src/app/components/ui/button";
import type { IngredientDTO } from "@/src/types/ingredient";
import { Input } from "@/src/app/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/src/app/components/ui/field"

const BREW_CATEGORIES = [
  { value: "MEAD", label: "Mead" },
  { value: "WINE", label: "Wine" },
  { value: "CIDER", label: "Cider" },
  { value: "BEER", label: "Beer" },
  { value: "KOMBUCHA", label: "Kombucha" },
  { value: "OTHER", label: "Other" },
] as const;

const MEAD_SUBTYPES = [
  {
    value: "ACERGLYN",
    label: "Acerglyn",
    description:
      "Brewed with maple syrup.",
  },
  {
    value: "BRAGGOT",
    label: "Braggot",
    description:
      "Brewed with both honey and grains.",
  },
  {
    value: "BOCHET",
    label: "Bochet",
    description:
      "Brewed with caramelized honey.",
  },
  {
    value: "CAPSICUMEL",
    label: "Capsicumel",
    description:
      "Brewed with spicy peppers.",
  },
  {
    value: "CYSER",
    label: "Cyser",
    description: "Brewed with apples or apple juice.",
  },
  {
    value: "SACK_MEAD",
    label: "Sack Mead (Great Mead)",
    description:
      "Brewed with a high honey-to-water ratio.",
  },
  {
    value: "HIPPOCRAS",
    label: "Hippocras",
    description:
      "Brewed with wine, cinnamon, spices, and sugar.",
  },
  {
    value: "HYDROMEL",
    label: "Hydromel",
    description:
      "Brewed with a low-ABV session mead.",
  },
  {
    value: "METHEGLIN",
    label: "Metheglin",
    description:
      "Brewed with spices such as cinnamon, nutmeg, or vanilla beans.",
  },
  {
    value: "MORAT",
    label: "Morat",
    description: "Brewed with mulberries.",
  },
  {
    value: "MELOMEL",
    label: "Melomel",
    description:
      'Brewed with fruit, whether fermented with or added after fermentation.',
  },
  {
    value: "MULLED_MEAD",
    label: "Mulled Mead",
    description:
      "Mead that is heated when served.",
  },
  {
    value: "OMPHACOMEL",
    label: "Omphacomel",
    description:
      "Brewed with the juice of unripened grapes to add sourness.",
  },
  {
    value: "OXYMEL",
    label: "Oxymel",
    description:
      "Brewed with vinegar, sometimes used as a base for medicinal purposes.",
  },
  {
    value: "PYMENT",
    label: "Pyment",
    description:
      "Brewed with grapes or blended with wine and mead components.",
  },
  {
    value: "RHODOMEL",
    label: "Rhodomel",
    description:
      "Brewed with rosehips, rose petals, or rose attar.",
  },
  {
    value: "SHORT_MEAD",
    label: "Short Mead (Hydromel)",
    description:
      "Quick-to-make, typically low-ABV mead.",
  },
  {
    value: "SHOW_MEAD",
    label: "Show Mead / Traditional Mead",
    description:
      "Classic mead of honey, water, and yeast — the standard traditional style.",
  },
  {
    value: "SPARKLING_MEAD",
    label: "Sparkling Mead",
    description:
      "Carbonated mead, either bottle-conditioned with added sugar/honey or force-carbonated.",
  },
  {
    value: "SOUR_MEAD",
    label: "Sour Mead",
    description:
      "Mead using wild yeasts and lactic bacteria to achieve a sour profile.",
  },
] as const;

const CUSTOM_VALUE = "__custom__";

type AdditionRow = {
  id: string;
  selectValue: string;
  customName: string;
  amount: string;
  unit: string;
  notes: string;
};

function newRow(): AdditionRow {
  return {
    id: crypto.randomUUID(),
    selectValue: "",
    customName: "",
    amount: "",
    unit: "",
    notes: "",
  };
}

export default function CreateBatch() {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<IngredientDTO[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("MEAD");
  const [meadSubtype, setMeadSubtype] = useState<string>("");
  const [startDate, setStartDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [brewDate, setBrewDate] = useState("");
  const [targetVolume, setTargetVolume] = useState("");
  const [originalGravity, setOriginalGravity] = useState("");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState<AdditionRow[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);

  const handleCoverImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0] ?? null;

    if (!file) {
      setCoverImage(null);
      setCoverImageUrl(null);
      return;
    }

    setCoverImage(file);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/uploads/cover-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data?.ok || typeof data.url !== "string") {
        throw new Error(
          typeof data?.error === "string"
            ? data.error
            : "Failed to upload cover image"
        );
      }

      setCoverImageUrl(data.url);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Failed to upload cover image"
      );
      setCoverImage(null);
      setCoverImageUrl(null);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/ingredients");
        if (!res.ok) {
          throw new Error("Could not load ingredient catalog");
        }
        const data = await res.json();
        if (!cancelled && data.ok && Array.isArray(data.ingredients)) {
          setIngredients(data.ingredients);
        }
      } catch (e) {
        if (!cancelled) {
          setCatalogError(
            e instanceof Error ? e.message : "Could not load ingredients"
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSelectIngredient = useCallback((rowId: string, value: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        if (value === CUSTOM_VALUE) {
          return {
            ...r,
            selectValue: CUSTOM_VALUE,
            customName: "",
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

  const addRow = () => setRows((r) => [...r, newRow()]);
  const removeRow = (id: string) =>
    setRows((r) => r.filter((x) => x.id !== id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!name.trim()) {
      setFormError("Give your batch a name.");
      return;
    }

    const additions: {
      ingredientId: string | null;
      customIngredientName: string | null;
      amount: number;
      unit: string;
      notes: string | null;
    }[] = [];

    for (const row of rows) {
      const isCustom = row.selectValue === CUSTOM_VALUE;
      const catalogId =
        !isCustom && row.selectValue ? row.selectValue : null;
      const customIngredientName = isCustom ? row.customName.trim() : "";
      if (!catalogId && !customIngredientName) continue;
      const amount = Number(row.amount);
      const unit = row.unit.trim();
      if (!Number.isFinite(amount) || amount <= 0 || !unit) {
        setFormError(
          "Each ingredient line needs a positive amount and a unit."
        );
        return;
      }
      additions.push({
        ingredientId: catalogId,
        customIngredientName: isCustom ? customIngredientName : null,
        amount,
        unit,
        notes: row.notes.trim() || null,
      });
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
    <div className="my-8 mx-[20vw] rounded-xl border-2 border-antique-white-600 bg-camel/75 px-8 py-6 shadow-lg shadow-black/20 backdrop-blur-xs">
      <div >
        <div className="mb-6 flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            className="button-style text-antique-white-900 hover:bg-black/10"
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <ArrowLeft className="size-8" />
          </Button>
          <div>
            <h1 className="zilla-slab-bold text-3xl text-gray-900">
              New batch
            </h1>
            <p className="nunito-sans-regular text-gray-700">
              Log the basics now; you can add fermentation events and readings later.
            </p>
          </div>
        </div>

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
              <select
                className="auth-input-style w-full"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
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
                  value={meadSubtype}
                  onChange={(e) => setMeadSubtype(e.target.value)}
                >
                  <option value="">— Select subtype —</option>
                  {MEAD_SUBTYPES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
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
              <input
                className="auth-input-style w-full"
                inputMode="decimal"
                value={targetVolume}
                onChange={(e) => setTargetVolume(e.target.value)}
                placeholder="e.g. 3"
              />
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

          <label className="flex flex-col gap-1 items-center">
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
              className="bg-gray-100 h-fit shadow-md hover:bg-gray-300 rounded-md border-2 hover:cursor-pointer border-gray-500 w-fit"
              accept="image/*"
              onChange={(e) => handleCoverImageChange(e)}
              placeholder="e.g. cover-image.jpg"
              autoComplete="off"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-gray-800">Notes</span>
            <textarea
              className="auth-input-style min-h-[100px] w-full resize-y"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Recipe ideas, yeast choice, etc."
            />
          </label>

          <section className="rounded-lg border border-antique-white-600 bg-antique-white-200/40 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-gray-900">
                Starting ingredients
              </h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-antique-white-600 bg-antique-white-100 button-style hover:bg-antique-white-50"
                onClick={addRow}
              >
                <Plus className="size-4" />
                Add ingredient
              </Button>
            </div>
            {rows.length === 0 ? (
              <p className="text-sm text-gray-600">
                Optional: add honey, fruit, water, yeast, or anything else you
                already know. Lines left blank are ignored.
              </p>
            ) : (
              <ul className="flex flex-col gap-4">
                {rows.map((row) => (
                  <li
                    key={row.id}
                    className="rounded-md border border-antique-white-500 bg-antique-white-100/80 p-3"
                  >

                    <div className="">
                      <div className="flex w-full gap-4">
                        <label className="flex flex-col gap-1 sm:col-span-2 w-full">
                          <span className="text-sm font-semibold tracking-wide text-gray-700">
                            Ingredient
                          </span>
                          <select
                            className="auth-input-style w-full text-sm"
                            value={
                              row.selectValue === CUSTOM_VALUE
                                ? CUSTOM_VALUE
                                : row.selectValue
                            }
                            onChange={(e) =>
                              onSelectIngredient(row.id, e.target.value)
                            }
                          >
                            <option value="">— Select —</option>
                            {ingredients.map((ing) => (
                              <option key={ing.id} value={ing.id}>
                                {ing.name}
                                {ing.brand ? ` (${ing.brand})` : ""} ·{" "}
                                {ing.ingredientType.replaceAll("_", " ")}
                              </option>
                            ))}
                            <option value={CUSTOM_VALUE}>Custom name…</option>
                          </select>
                        </label>

                        <Button
                          type="button"
                          variant="ghost"
                          className="text-red-800 hover:bg-red-200 button-style rounded-lg"
                          onClick={() => removeRow(row.id)}
                          aria-label="Remove row"
                        >
                          <Trash2 className="size-4 " />
                        </Button>
                      </div>
                      <div>

                      </div>
                      {row.selectValue === CUSTOM_VALUE && (
                        <label className="flex flex-col gap-1 sm:col-span-2">
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
                            placeholder="e.g. Local wildflower honey"
                          />
                        </label>
                      )}
                      <div className="flex w-full gap-4">
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
                          placeholder="lb, gal, g…"
                        />
                      </label>
                      </div>

                      <label className="flex flex-col gap-1 sm:col-span-2">
                        <span className="text-sm font-semibold text-gray-700">
                          Line notes <span className="font-normal">(optional)</span>
                        </span>
                        <input
                          className="auth-input-style w-full text-sm"
                          value={row.notes}
                          onChange={(e) =>
                            setRows((prev) =>
                              prev.map((r) =>
                                r.id === row.id
                                  ? { ...r, notes: e.target.value }
                                  : r
                              )
                            )
                          }
                        />
                      </label>
                      </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-golden-orange-600 hover:bg-golden-orange-700 
              text-white shadow-style button-style border-2 border-cayenne-red-600 hover:border-cayenne-red-700"
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
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/")}
              disabled={submitting}
              className="shadow-style bg-cayenne-red hover:bg-cayenne-red-700 button-style border-2 border-cayenne-red-600 hover:border-cayenne-red-800 text-golden-orange-100 hover:text-golden-orange-200"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
