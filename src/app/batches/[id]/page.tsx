import { notFound } from "next/navigation";
import Image from "next/image";
import { getBatchPageData } from "@/src/server/batches";
import { ABVChart } from "../../components/ABVChart";
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

const tableWrap =
  "overflow-x-auto rounded-lg border-2 border-golden-orange-700 bg-antique-white-100/80";
const thCell =
  "border-b-2 border-golden-orange-700 bg-golden-orange-100/50 px-3 py-2 text-left text-sm font-semibold";
const tdCell = "border-b border-golden-orange-700/40 px-3 py-2 text-sm nunito-sans-regular";

export default async function BatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pageData = await getBatchPageData(id);
  if (!pageData) {
    notFound();
  }

  const { batch, abvRows } = pageData;
  const name = batch.name;
  const thumbnailImageUrl = batch.thumbnailImageUrl;

  return (
    <div className="my-8 flex h-full w-[90vw] flex-col gap-4 rounded-xl border-2 border-golden-orange-700 bg-camel/75 px-8 py-6 shadow-lg shadow-black/20 backdrop-blur-xs mx-auto">
      <h1 className="text-2xl font-bold">{name}</h1>
      <div className="flex flex-row gap-8">
      <div className="flex w-[30%] shrink-0 flex-col gap-4">
        <div className="flex flex-col rounded-xl border-2 border-golden-orange-700">
          <Image
            src={thumbnailImageUrl ?? "/img/default.jpg"}
            alt={name}
            width={1000}
            height={1000}
            className="rounded-t-xl"
          />
          <p className="rounded-b-xl bg-golden-orange-100/60 px-3 border-t-2 border-golden-orange-700 py-2 text-md font-semibold">Thumbnail</p>
        </div>
        
        <ABVChart ABVData={abvRows.map((row) => ({ measuredAt: row.measuredAt, abv: row.abv }))} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-8">
          <div className={`min-w-0 flex-1 ${tableWrap}`}>
            <h2 className="border-b-2 border-golden-orange-700 bg-golden-orange-100/60 px-3 py-2 text-lg font-semibold">
              Ingredients added
            </h2>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={thCell}>Name</th>
                  <th className={thCell}>Type</th>
                  <th className={thCell}>Date added</th>
                </tr>
              </thead>
              <tbody>
                {batch.additions.length === 0 ? (
                  <tr>
                    <td className={tdCell} colSpan={3}>
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
                        <td className={tdCell}>{displayName}</td>
                        <td className={tdCell}>{typeLabel}</td>
                        <td className={tdCell}>{formatDate(when)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <dl className="grid w-full min-w-56 shrink-0 grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-lg border-2 border-golden-orange-700 bg-antique-white-100/80 p-4 text-sm lg:max-w-md">
            <dt className="font-semibold text-foreground/90">Name</dt>
            <dd className="nunito-sans-regular">{name}</dd>

            <dt className="font-semibold text-foreground/90">Category</dt>
            <dd className="nunito-sans-regular">{formatCategoryLabel(batch.category as BrewCategory)}</dd>

            {batch.meadSubtype ? (
              <>
                <dt className="font-semibold text-foreground/90">Subcategory</dt>
                <dd className="nunito-sans-regular">
                  {formatMeadSubtypeLabel(batch.meadSubtype) ?? formatEnumLabel(batch.meadSubtype)}
                </dd>
              </>
            ) : null}

            <dt className="font-semibold text-foreground/90">Current ABV</dt>
            <dd className="nunito-sans-regular">
              {currentAbvDisplay({
                calculatedABV: batch.calculatedABV,
                abvRows,
                originalGravity: batch.originalGravity,
                finalGravity: batch.finalGravity,
              })}
            </dd>

            <dt className="font-semibold text-foreground/90">Date started</dt>
            <dd className="nunito-sans-regular">{formatDate(batch.startDate)}</dd>

            <dt className="font-semibold text-foreground/90">Original gravity</dt>
            <dd className="nunito-sans-regular">{formatGravity(batch.originalGravity)}</dd>

            <dt className="font-semibold text-foreground/90">Current specific gravity</dt>
            <dd className="nunito-sans-regular">{formatGravity(batch.finalGravity)}</dd>
          </dl>
        </div>

        <div className={`min-h-0 flex-1 ${tableWrap}`}>
          <h2 className="border-b-2 border-golden-orange-700 bg-golden-orange-100/60 px-3 py-2 text-lg font-semibold">
            Events
          </h2>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={thCell}>When</th>
                <th className={thCell}>Type</th>
                <th className={thCell}>Title</th>
                <th className={thCell}>Description</th>
              </tr>
            </thead>
            <tbody>
              {batch.events.length === 0 ? (
                <tr>
                  <td className={tdCell} colSpan={4}>
                    No events yet.
                  </td>
                </tr>
              ) : (
                batch.events.map((ev) => (
                  <tr key={ev.id}>
                    <td className={`${tdCell} whitespace-nowrap`}>{formatDateTime(ev.occurredAt)}</td>
                    <td className={tdCell}>{formatEventType(ev.eventType)}</td>
                    <td className={tdCell}>{ev.title}</td>
                    <td className={tdCell}>{ev.description?.trim() ? ev.description : "—"}</td>
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
