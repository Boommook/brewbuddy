import { getBatchesForDashboard } from "@/src/server/batches";
import BatchCard from "./BatchCard";

export default async function Dashboard() {
  const batches = await getBatchesForDashboard();
  return (
    <div className="my-8 mx-auto flex">
        <div className="w-full justify-center items-center grid grid-cols-3 gap-12">
            {batches.map((batch) => (
                <BatchCard key={batch.id} id={batch.id} title={batch.name} type={batch.category} stage={batch.currentStage} image={batch.image} abv={batch.abv} favourite={batch.favourite} createdAt={batch.createdAt} lastCheckedAt={batch.lastCheckedAt} OG={batch.OG} FG={batch.FG} />
            ))}
        </div>
    </div>
  );
}