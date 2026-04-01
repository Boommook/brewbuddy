-- AlterTable
ALTER TABLE "Batch" ADD COLUMN     "isFavorite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "thumbnailImageUrl" TEXT;

-- CreateIndex
CREATE INDEX "Batch_isFavorite_idx" ON "Batch"("isFavorite");
