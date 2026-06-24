import { notFound } from "next/navigation";
import { getBatchPageData } from "@/src/server/batches";
import BatchPageContent from "./BatchPageContent";

export default async function BatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pageData = await getBatchPageData(id);
  if (!pageData) {
    notFound();
  }

  const { batch, abvRows } = pageData;

  return <BatchPageContent id={id} batch={batch} abvRows={abvRows} />;
}
