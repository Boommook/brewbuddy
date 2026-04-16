"use client";
import BatchCard from "./BatchCard";
import { calculateABV } from "@/src/lib/utils/helpers";
import { BatchDTO } from "@/src/types/batch";
import { useMemo } from "react";
import { useDashboardSort } from "./DashboardSortContext";

const FALLBACK_BATCH_IMAGE = "/img/default.jpg";

function formatMeadSubtype(subtype: string | null): string | null {
  if (!subtype) return null;
  return subtype
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/** matches urgency in `BatchCard` (from last logged measurement or event). */
function batchUrgency(batch: BatchDTO): number {
  const last = new Date(batch.lastLoggedAt).getTime();
  return (
    7 -
    Math.floor((Date.now() - last) / (1000 * 60 * 60 * 24))
  );
}

function sortBatches(batches: BatchDTO[], sort: string): BatchDTO[] {
  batches.sort((a, b) => {
    const fa = a.isFavorite ? 1 : 0;
    const fb = b.isFavorite ? 1 : 0;
    if (fa !== fb) return fb - fa;

    switch (sort) {
      case "mostUrgent":
        return batchUrgency(a) - batchUrgency(b);
      case "leastUrgent":
        return batchUrgency(b) - batchUrgency(a);
      case "nameAZ":
        return a.name.localeCompare(b.name);
      case "nameZA":
        return b.name.localeCompare(a.name);
      case "newest":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      default:
        return 0;
    }
  });
  return batches;
}

export default function Dashboard({ batches }: { batches: BatchDTO[] }) {
  const { selectedSort } = useDashboardSort();

  // useMemo to sort the batches only when the selected sort changes
  const sortedBatches = useMemo(
    () => sortBatches(batches, selectedSort),
    [batches, selectedSort],
  );

  return (
    <div className="my-8 mx-auto flex">
        {batches.length > 0 ? <div className="w-full justify-center items-center grid grid-cols-3 gap-12">
            {sortedBatches.map((batch) => (
                // For mead batches, prefer the mead subtype label as the type.
                // For all others, show the category enum value.
                <BatchCard
                  key={batch.id}
                  id={batch.id}
                  title={batch.name}
                  type={
                    batch.category === "MEAD"
                      ? formatMeadSubtype((batch as any).meadSubtype ?? null) ??
                        batch.category
                      : batch.category
                  }
                  stage={batch.currentStage}
                  image={batch.thumbnailImageUrl ?? FALLBACK_BATCH_IMAGE}
                  abv={calculateABV(batch.originalGravity, batch.finalGravity)}
                  favourite={batch.isFavorite}
                  createdAt={new Date(batch.createdAt)}
                  lastCheckedAt={new Date(batch.lastLoggedAt)}
                  OG={Number(batch.originalGravity)}
                  FG={Number(batch.finalGravity)}
                />
            ))}
        </div> : <div className="w-1/2 mx-auto text-center mt-12 text-3xl font-bold justify-center items-center">
            <p>No batches found. Create a new batch by clicking the plus icon in the top right corner to get started.</p>
        </div>}
    </div>
  );
}