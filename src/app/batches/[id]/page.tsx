import { getBatchSummaryForUser } from "@/src/server/batches";
import { notFound } from "next/navigation";

export default function BatchPage({ params }: { params: { id: string } }) {
  return <div>BatchPage</div>;
}