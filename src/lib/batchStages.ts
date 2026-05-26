import type { BatchStage } from "../generated/prisma/index.js";

export const BATCH_STAGE_OPTIONS: { value: BatchStage; label: string }[] = [
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

const STAGE_SET = new Set<string>(BATCH_STAGE_OPTIONS.map((o) => o.value));

export function formatBatchStage(stage: BatchStage | string): string {
  const match = BATCH_STAGE_OPTIONS.find((o) => o.value === stage);
  return match?.label ?? String(stage);
}

export function isBatchStage(value: string): value is BatchStage {
  return STAGE_SET.has(value);
}
