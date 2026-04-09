import { notFound } from "next/navigation";
import { getBatchPageData } from "@/src/server/batches";
import { ABVChart } from "../../components/ABVChart";
import BatchPageThumbnail from "../../components/BatchPageThumbnail";
import {
  BREW_CATEGORIES,
  MEAD_SUBCATEGORIES,
  type BrewCategory,
} from "@/src/types/batch_types";
import { calculateABV } from "@/src/lib/utils/helpers";
import type { IngredientType, EventType, MeadSubtype } from "@/src/generated/prisma/index.js";

function formatCategoryLabel(category: BrewCategory): string {
  return BREW_CATEGORIES.find((c) => c.value === category)?.label ?? category;
}

function formatMeadSubtypeLabel(subtype: MeadSubtype | null): string | null {
  if (!subtype) return null;
  return MEAD_SUBCATEGORIES.find((m) => m.value === subtype)?.label ?? null;
}

function formatEnumLabel(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatIngredientType(type: IngredientType | null | undefined): string {
  if (!type) return "—";
  return formatEnumLabel(type);
}

function formatEventType(type: EventType): string {
  return formatEnumLabel(type);
}

function formatDate(d: Date | null | undefined): string {
  if (!d) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(d: Date): string {
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatGravity(value: { toString(): string } | null | undefined): string {
  if (value == null) return "—";
  return value.toString();
}

function currentAbvDisplay(args: {
  calculatedABV: { toString(): string } | null | undefined;
  abvRows: { abv: number }[];
  originalGravity: { toString(): string } | null | undefined;
  finalGravity: { toString(): string } | null | undefined;
}): string {
  if (args.calculatedABV != null) {
    const n = Number(args.calculatedABV.toString());
    if (Number.isFinite(n)) return `${n.toFixed(2)}%`;
  }
  if (args.abvRows.length > 0) {
    const n = args.abvRows[args.abvRows.length - 1]!.abv;
    return `${n.toFixed(2)}%`;
  }
  const fromGravities = calculateABV(
    args.originalGravity?.toString() ?? null,
    args.finalGravity?.toString() ?? null,
  );
  if (fromGravities > 0) return `${fromGravities.toFixed(2)}%`;
  return "—";
}

export default async function BatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pageData = await getBatchPageData(id);
  if (!pageData) {
    notFound();
  }

  const { batch, abvRows } = pageData;
  const name = batch.name;

  return (
    <div className="my-8 flex h-full w-[90vw] flex-col gap-4 rounded-xl border-2 border-golden-orange-700 bg-camel/75 px-8 py-6 shadow-lg shadow-black/20 backdrop-blur-xs mx-auto">
      <h1 className="text-2xl font-bold">{name}</h1>
      <div className="flex flex-row gap-8">
      <div className="flex w-[30%] shrink-0 flex-col gap-4">
        <div className="flex flex-col shadow-style w-full shrink-0 rounded-lg border-2 border-golden-orange-700 bg-antique-white-100/80 text-sm">
          <h2 className="text-header rounded-t-lg border-b-2 border-harvest-orange-600 bg-golden-orange-100/60 px-3 py-2 text-lg font-semibold">
              Batch Details
          </h2>
          <dl className="grid w-full shrink-0 grid-cols-[auto_1fr] gap-x-4 gap-y-2 px-4 py-2 pb-4">
            <dt className="font-semibold text-foreground">Category</dt>
            <dd className="nunito-sans-regular">{formatCategoryLabel(batch.category as BrewCategory)}</dd>

            {batch.meadSubtype ? (
              <>
                <dt className="font-semibold text-foreground">Subcategory</dt>
                <dd className="nunito-sans-regular">
                  {formatMeadSubtypeLabel(batch.meadSubtype) ?? formatEnumLabel(batch.meadSubtype)}
                </dd>
              </>
            ) : null}

            <dt className="font-semibold text-foreground">Current ABV</dt>
            <dd className="nunito-sans-regular">
              {currentAbvDisplay({
                calculatedABV: batch.calculatedABV,
                abvRows,
                originalGravity: batch.originalGravity,
                finalGravity: batch.finalGravity,
              })}
            </dd>

            <dt className="font-semibold text-foreground">Date started</dt>
            <dd className="nunito-sans-regular">{formatDate(batch.startDate)}</dd>

            <dt className="font-semibold text-foreground">Original gravity</dt>
            <dd className="nunito-sans-regular">{formatGravity(batch.originalGravity)}</dd>

            <dt className="font-semibold text-foreground">Current specific gravity</dt>
            <dd className="nunito-sans-regular">{formatGravity(batch.finalGravity)}</dd>
          </dl>
        </div>
        <BatchPageThumbnail
          batchId={batch.id}
          imageUrl={batch.thumbnailImageUrl}
          alt={name}
        />
        
        <ABVChart ABVData={abvRows.map((row) => ({ measuredAt: row.measuredAt, abv: row.abv }))} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <div className="flex flex-row gap-4 lg:items-start lg:gap-8">
          
        
          <div className="min-w-0 flex-1 table-wrap shadow-style">
            <h2 className="border-b-2 text-header border-harvest-orange-600 bg-golden-orange-100/60 px-3 py-2 text-lg font-semibold">
              Ingredients added
            </h2>
            <table className="w-full border-collapse">
              <thead>
                <tr className="text-header">
                  <th className="thcell">Name</th>
                  <th className="thcell">Type</th>
                  <th className={"thcell"}>Date added</th>
                  <th className={"thcell"}>Amount</th>
                  <th className={"thcell"}>Unit</th>
                  <th className={"thcell"}>Notes</th>
                </tr>
              </thead>
              <tbody>
                {batch.additions.length === 0 ? (
                  <tr>
                    <td className={"tdcell"} colSpan={3}>
                      No ingredients recorded.
                    </td>
                  </tr>
                ) : (
                  batch.additions.map((a) => {
                    const displayName = a.ingredient?.name ?? a.customIngredientName ?? "—";
                    const typeLabel = a.ingredient
                      ? formatIngredientType(a.ingredient.ingredientType)
                      : (a.additionType?.trim() || "—");
                    const when = a.addedAt ?? a.createdAt;
                    return (
                      <tr key={a.id}>
                        <td className={"tdcell"}>{displayName}</td>
                        <td className={"tdcell"}>{typeLabel}</td>
                        <td className={"tdcell"}>{formatDate(when)}</td>
                        <td className={"tdcell"}>{a.amount?.toString() ?? "—"}</td>
                        <td className={"tdcell"}>{a.unit ?? "—"}</td>
                        <td className={"tdcell"}>{a.notes?.trim() ? a.notes : "—"}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
          

        <div className="min-h-0 flex-1 table-wrap shadow-style">
          <h2 className="border-b-2 border-harvest-orange-600 bg-golden-orange-100/60 px-3 py-2 text-lg font-semibold">
            Events
          </h2>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={"thcell"}>When</th>
                <th className={"thcell"}>Type</th>
                <th className={"thcell"}>Title</th>
                <th className={"thcell"}>Description</th>
              </tr>
            </thead>
            <tbody>
              {batch.events.length === 0 ? (
                <tr>
                  <td className={"tdcell"} colSpan={4}>
                    No events yet.
                  </td>
                </tr>
              ) : (
                batch.events.map((ev) => (
                  <tr key={ev.id}>
                    <td className={`tdcell whitespace-nowrap`}>{formatDateTime(ev.occurredAt)}</td>
                    <td className={"tdcell"}>{formatEventType(ev.eventType)}</td>
                    <td className={"tdcell"}>{ev.title}</td>
                    <td className={"tdcell"}>{ev.description?.trim() ? ev.description : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>
    </div>
  );
}
