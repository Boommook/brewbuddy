-- Backfill from row `updatedAt` so existing batches keep the same “last checked” behavior.
ALTER TABLE "Batch" ADD COLUMN "lastLoggedAt" TIMESTAMP(3);

UPDATE "Batch" SET "lastLoggedAt" = "updatedAt";

ALTER TABLE "Batch" ALTER COLUMN "lastLoggedAt" SET NOT NULL;
