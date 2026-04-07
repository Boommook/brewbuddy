import { redirect, notFound } from "next/navigation";
import { getUserId } from "@/src/server/auth";
import { getBatchSummaryForUser } from "@/src/server/batches";
import LogBatchActivity from "../../../components/LogBatchActivity";

export default async function BatchLogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await getUserId();
  if (!userId) {
    redirect("/login");
  }

  const { id } = await params;
  const batch = await getBatchSummaryForUser(id);
  if (!batch) {
    notFound();
  }

  return (
    <div className="w-full flex justify-center items-center">
      <LogBatchActivity batchId={batch.id} batchName={batch.name} />
    </div>
  );
}
