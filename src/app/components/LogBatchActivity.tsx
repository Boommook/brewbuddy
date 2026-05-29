"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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
import BackButton from "./buttons/BackButton";
import { groupIngredientsByType } from "@/src/lib/ingredientCatalog";
import IngredientLinesSection from "./IngredientLinesSection";
import { BATCH_STAGE_OPTIONS } from "@/src/lib/batchStages";
import type { BatchStage } from "@/src/generated/prisma/index.js";
import {
  type IngredientLineRow,
  ingredientLineInputsFromRows,
  newIngredientLineRow,
} from "@/src/types/ingredientLines";

const STAGE_REQUIRED_EVENTS = new Set<string>(["STABILIZED", "TRANSFERRED"]);

const CUSTOM_VALUE = "__custom__";

function toDatetimeLocalValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type Props = {
  batchId: string;
  batchName: string;
  batchCurrentStage: BatchStage;
};

export default function LogBatchActivity({
  batchId,
  batchName,
  batchCurrentStage,
}: Props) {
  const router = useRouter();
  const [ingredients, setIngredients] = useState<IngredientDTO[]>([]);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [logSelect, setLogSelect] = useState<string>(DEFAULT_LOG_SELECT);
  const [valueStr, setValueStr] = useState("");
  const [unit, setUnit] = useState(defaultUnitForMeasurement("SPECIFIC_GRAVITY"));
  const [note, setNote] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [occurredAtLocal, setOccurredAtLocal] = useState(() =>
    toDatetimeLocalValue(new Date())
  );
  const [rows, setRows] = useState<IngredientLineRow[]>([]);

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

  const sortedRows = useMemo(() => {
    if (sort === "newest") {
      return [...rows].reverse();
    } else {
      return [...rows];
    }
  }, [rows, sort]);

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

  const groupedCatalog = useMemo(
    () => groupIngredientsByType(ingredients),
    [ingredients]
  );

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

  const addRow = () =>
    setRows((r) => [...r, newIngredientLineRow(batchCurrentStage)]);
  const removeRow = (id: string) => setRows((r) => r.filter((x) => x.id !== id));

  const buildAdditionsPayload = () => ingredientLineInputsFromRows(rows);

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
    <div className="md:my-8 md:mx-[20vw] w-full h-full md:rounded-xl md:border-2 border-golden-orange-700 bg-camel/75 px-8 py-6 shadow-lg shadow-black/20 backdrop-blur-xs nunito-sans-regular">
      <div className="mb-6 flex items-center gap-4">
        <BackButton />
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
          <IngredientLinesSection
            title="Ingredients added/used"
            description="Log stabilizers, sweetening agents, or other additions used for this step. Lines left blank are ignored."
            emptyMessage={
              <>
                No ingredient lines yet — add one if this step included additions.
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
            customNamePlaceholder="e.g. Potassium sorbate"
            unitPlaceholder="tsp, g, oz…"
          />
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
