"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/src/app/components/ui/button";
import type { IngredientDTO } from "@/src/types/ingredient";
import {
  BATCH_LOG_OPTIONS,
  DEFAULT_LOG_SELECT,
  defaultTitleForEventType,
  defaultUnitForMeasurement,
  eventTypeSupportsIngredients,
  measurementHint,
} from "@/src/lib/batchLogOptions";

const STAGE_REQUIRED_EVENTS = new Set<string>(["STABILIZED", "TRANSFERRED"]);

const BATCH_STAGE_OPTIONS: { value: string; label: string }[] = [
  { value: "PLANNING", label: "Planning" },
  { value: "PRIMARY", label: "Primary fermentation" },
  { value: "SECONDARY", label: "Secondary fermentation" },
  { value: "BULK_AGING", label: "Bulk aging" },
  { value: "STABILIZING", label: "Stabilizing" },
  { value: "BACKSWEETENING", label: "Backsweetening" },
  { value: "PACKAGING", label: "Packaging" },
  { value: "CONDITIONING", label: "Conditioning" },
  { value: "DONE", label: "Done" },
];

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

function toDatetimeLocalValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type Props = {
  batchId: string;
  batchName: string;
};

export default function LogBatchActivity({ batchId, batchName }: Props) {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<IngredientDTO[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [logSelect, setLogSelect] = useState<string>(DEFAULT_LOG_SELECT);
  const [valueStr, setValueStr] = useState("");
  const [unit, setUnit] = useState(defaultUnitForMeasurement("SPECIFIC_GRAVITY"));
  const [note, setNote] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [occurredAtLocal, setOccurredAtLocal] = useState(() =>
    toDatetimeLocalValue(new Date())
  );
  const [rows, setRows] = useState<AdditionRow[]>([]);

  const [newStage, setNewStage] = useState<string>("");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isMeasurement = logSelect.startsWith("m:");
  const measurementType = isMeasurement ? logSelect.slice(2) : "";
  const eventType = !isMeasurement ? logSelect.slice(2) : "";
  const showIngredients =
    !isMeasurement && eventTypeSupportsIngredients(eventType);

  const requiresNewStage =
    !isMeasurement && STAGE_REQUIRED_EVENTS.has(eventType);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/ingredients");
        if (!res.ok) throw new Error("Could not load ingredient catalog");
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

  const logGroups = useMemo(() => {
    const g = new Map<string, typeof BATCH_LOG_OPTIONS>();
    for (const o of BATCH_LOG_OPTIONS) {
      const list = g.get(o.group) ?? [];
      list.push(o);
      g.set(o.group, list);
    }
    return Array.from(g.entries());
  }, []);

  const onLogSelectChange = (v: string) => {
    setLogSelect(v);
    if (v.startsWith("m:")) {
      setUnit(defaultUnitForMeasurement(v.slice(2)));
    } else {
      setEventTitle(defaultTitleForEventType(v.slice(2)));
      if (!eventTypeSupportsIngredients(v.slice(2))) {
        setRows([]);
      }
      setNewStage("");
    }
  };

  const onSelectIngredient = useCallback(
    (rowId: string, value: string) => {
      setRows((prev) =>
        prev.map((r) => {
          if (r.id !== rowId) return r;
          if (value === CUSTOM_VALUE) {
            return { ...r, selectValue: CUSTOM_VALUE, customName: "", unit: r.unit };
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
    },
    [ingredients]
  );

  const addRow = () => setRows((r) => [...r, newRow()]);
  const removeRow = (id: string) => setRows((r) => r.filter((x) => x.id !== id));

  const buildAdditionsPayload = (): {
    ingredientId: string | null;
    customIngredientName: string | null;
    amount: number;
    unit: string;
    notes: string | null;
  }[] => {
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
      const unitStr = row.unit.trim();
      if (!Number.isFinite(amount) || amount <= 0 || !unitStr) {
        throw new Error(
          "Each ingredient line needs a positive amount and a unit."
        );
      }
      additions.push({
        ingredientId: catalogId,
        customIngredientName: isCustom ? customIngredientName : null,
        amount,
        unit: unitStr,
        notes: row.notes.trim() || null,
      });
    }
    return additions;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const occurredAt = new Date(occurredAtLocal);
    if (Number.isNaN(occurredAt.getTime())) {
      setFormError("Invalid date/time.");
      return;
    }
    const iso = occurredAt.toISOString();

    let body: Record<string, unknown>;

    if (isMeasurement) {
      const num = Number(valueStr);
      if (!Number.isFinite(num)) {
        setFormError("Enter a numeric value for the measurement.");
        return;
      }
      body = {
        kind: "measurement",
        measurementType,
        value: num,
        unit: unit.trim() || null,
        measuredAt: iso,
        note: note.trim() || null,
      };
    } else {
      const t = eventTitle.trim();
      if (!t) {
        setFormError("Title is required for events.");
        return;
      }

      if (requiresNewStage && !newStage) {
        setFormError("Select the new batch stage for this event.");
        return;
      }

      let additionsPayload: ReturnType<typeof buildAdditionsPayload> | undefined;
      if (showIngredients) {
        try {
          additionsPayload = buildAdditionsPayload();
        } catch (err) {
          setFormError(
            err instanceof Error ? err.message : "Check ingredient lines."
          );
          return;
        }
      }

      body = {
        kind: "event",
        eventType,
        title: t,
        description: eventDescription.trim() || null,
        occurredAt: iso,
        ...(requiresNewStage && newStage ? { newStage } : {}),
        ...(showIngredients && additionsPayload && additionsPayload.length > 0
          ? { additions: additionsPayload }
          : {}),
      };
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/batches/${batchId}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setFormError(data.error ?? "Could not save log.");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setFormError("Could not save log.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="my-8 mx-[20vw] w-full rounded-xl border-2 border-golden-orange-700 bg-camel/75 px-8 py-6 shadow-lg shadow-black/20 backdrop-blur-xs nunito-sans-regular">
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
            Log batch activity
          </h1>
          <p className="text-gray-700">{batchName}</p>
        </div>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-6">
        {catalogError ? (
          <p className="rounded-md border border-amber-700/50 bg-amber-100/80 px-3 py-2 text-sm text-amber-950">
            {catalogError} — you can still use custom ingredient names below.
          </p>
        ) : null}
        {formError ? (
          <p className="rounded-md border border-red-700/40 bg-red-100/80 px-3 py-2 text-sm text-red-950">
            {formError}
          </p>
        ) : null}

        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-gray-800">Type</span>
          <select
            className="auth-input-style w-full"
            value={logSelect}
            onChange={(e) => onLogSelectChange(e.target.value)}
          >
            {logGroups.map(([groupName, opts]) => (
              <optgroup key={groupName} label={groupName}>
                {opts.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-gray-800">Date & time</span>
          <input
            type="datetime-local"
            className="auth-input-style w-full"
            value={occurredAtLocal}
            onChange={(e) => setOccurredAtLocal(e.target.value)}
          />
        </label>
            
        {isMeasurement ? (
          <div className="flex flex-col gap-2">
            <div className="flex flex-row gap-2 ">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-gray-800">
                Value ({measurementType.replace(/_/g, " ").toLowerCase()})
              </span>
              <input
                className="auth-input-style w-full"
                inputMode="decimal"
                placeholder={measurementHint(measurementType)}
                value={valueStr}
                onChange={(e) => setValueStr(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-gray-800">
                Unit <span className="font-normal text-gray-600">(optional)</span>
              </span>
              <input
                className="auth-input-style w-full"
                placeholder="e.g. °F, gal"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </label>
            </div>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-sm font-semibold text-gray-800">
                Note <span className="font-normal text-gray-600">(optional)</span>
              </span>
              <textarea
                className="auth-input-style min-h-[88px] w-full resize-y"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-gray-800">Title</span>
              <input
                className="auth-input-style w-full"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-gray-800">
                Description{" "}
                <span className="font-normal text-gray-600">(optional)</span>
              </span>
              <textarea
                className="auth-input-style min-h-[120px] w-full resize-y"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="Details, observations, next steps…"
              />
            </label>
            {requiresNewStage ? (
              <label className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-gray-800">
                  New batch stage
                </span>
                <select
                  className="auth-input-style w-full"
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value)}
                >
                  <option value="">— Select stage —</option>
                  {BATCH_STAGE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span className="text-xs text-gray-600">
                  When a batch is stabilized or transferred/racked, choose what
                  stage it moves into next.
                </span>
              </label>
            ) : null}
          </div>
        )}

        {showIngredients ? (
          <section className="rounded-lg border border-antique-white-600 bg-antique-white-200/40 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="heading-style text-lg font-bold text-gray-900">
                Ingredients added/used
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
            <p className="mb-3 text-style text-sm text-gray-600">
              Log stabilizers, sweetening agents, or other additions used for this
              step. Lines left blank are ignored.
            </p>
            {rows.length === 0 ? (
              <p className="text-style text-sm text-gray-600">
                No ingredient lines yet — add one if this step included
                additions.
              </p>
            ) : (
              <ul className="flex flex-col gap-4">
                {rows.map((row) => (
                  <li
                    key={row.id}
                    className="rounded-md border border-antique-white-500 bg-antique-white-100/80 p-3"
                  >
                    <div className="flex w-full gap-4">
                      <label className="flex w-full flex-col gap-1">
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
                              {ing.ingredientType.replace(/_/g, " ")}
                            </option>
                          ))}
                          <option value={CUSTOM_VALUE}>Custom name…</option>
                        </select>
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        className="rounded-lg text-red-800 button-style hover:bg-red-200"
                        onClick={() => removeRow(row.id)}
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
                          placeholder="e.g. Potassium sorbate"
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
                          placeholder="tsp, g, oz…"
                        />
                      </label>
                    </div>
                    <label className="mt-2 flex flex-col gap-1">
                      <span className="text-sm font-semibold text-gray-700">
                        Line notes{" "}
                        <span className="font-normal">(optional)</span>
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
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button
            type="submit"
            disabled={submitting}
            className="save-button"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save log"
            )}
          </Button>
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
  );
}
