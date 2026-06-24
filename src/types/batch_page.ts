import type { Prisma } from "@/src/generated/prisma/index.js";

export type BatchPageBatch = Prisma.BatchGetPayload<{
  include: {
    additions: { include: { ingredient: true } };
    events: true;
  };
}>;

export type BatchPageAbvRow = {
  id: string;
  measuredAt: Date;
  specificGravity: number;
  abv: number;
};

export type BatchPageContentProps = {
  id: string;
  batch: BatchPageBatch;
  abvRows: BatchPageAbvRow[];
};
