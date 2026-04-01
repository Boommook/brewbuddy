import { getBatchesForDashboard } from "@/src/server/batches";
import BatchCard from "./BatchCard";

const FALLBACK_BATCH_IMAGE = "/img/default.jpg";

function calculateABV(oG: string | null, fG: string | null): number {
  if (oG === null || oG === "" || fG === null || fG === "") return 0;
  const og = Number(oG);
  const fg = Number(fG);
  return (fg - og) * 131.25 ;
}

function formatMeadSubtype(subtype: string | null): string | null {
  if (!subtype) return null;
  return subtype
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default async function Dashboard() {
  const batches = await getBatchesForDashboard();
  return (
    <div className="my-8 mx-auto flex">
        {batches.length > 0 ? <div className="w-full justify-center items-center grid grid-cols-3 gap-12">
            {batches.map((batch) => (
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
                  lastCheckedAt={new Date(batch.updatedAt)}
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