/*
  Warnings:

  - The `status` column on the `Batch` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `category` to the `Batch` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BrewCategory" AS ENUM ('MEAD', 'WINE', 'CIDER', 'BEER', 'KOMBUCHA', 'OTHER');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('PLANNED', 'ACTIVE', 'CONDITIONING', 'PACKAGED', 'COMPLETED', 'ABORTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "BatchStage" AS ENUM ('PLANNING', 'PRIMARY', 'SECONDARY', 'BULK_AGING', 'STABILIZING', 'BACKSWEETENING', 'PACKAGING', 'CONDITIONING', 'DONE');

-- CreateEnum
CREATE TYPE "IngredientType" AS ENUM ('HONEY', 'WATER', 'YEAST', 'NUTRIENT', 'FRUIT', 'SPICE', 'HERB', 'ACID', 'TANNIN', 'SUGAR', 'OAK', 'STABILIZER', 'FINING_AGENT', 'OTHER');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('CREATED', 'PITCHED_YEAST', 'NUTRIENT_ADDED', 'TRANSFERRED', 'STABILIZED', 'BACKSWEETENED', 'PACKAGED', 'TASTING_NOTE', 'PROBLEM_NOTED', 'GENERAL_NOTE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MeasurementType" AS ENUM ('SPECIFIC_GRAVITY', 'BRIX', 'PH', 'TEMPERATURE', 'VOLUME', 'ABV_ESTIMATE');

-- AlterTable
ALTER TABLE "Batch" ADD COLUMN     "actualVolume" DECIMAL(10,3),
ADD COLUMN     "brewDate" TIMESTAMP(3),
ADD COLUMN     "calculatedABV" DECIMAL(5,2),
ADD COLUMN     "category" "BrewCategory" NOT NULL,
ADD COLUMN     "completedDate" TIMESTAMP(3),
ADD COLUMN     "currentStage" "BatchStage" NOT NULL DEFAULT 'PLANNING',
ADD COLUMN     "finalGravity" DECIMAL(6,3),
ADD COLUMN     "originalGravity" DECIMAL(6,3),
ADD COLUMN     "targetVolume" DECIMAL(10,3),
DROP COLUMN "status",
ADD COLUMN     "status" "BatchStatus" NOT NULL DEFAULT 'PLANNED';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "displayName" TEXT;

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" UUID NOT NULL,
    "userId" UUID,
    "name" TEXT NOT NULL,
    "ingredientType" "IngredientType" NOT NULL,
    "brand" TEXT,
    "defaultUnit" TEXT,
    "notes" TEXT,
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchIngredientAddition" (
    "id" UUID NOT NULL,
    "batchId" UUID NOT NULL,
    "ingredientId" UUID,
    "customIngredientName" TEXT,
    "amount" DECIMAL(10,3) NOT NULL,
    "unit" TEXT NOT NULL,
    "purpose" TEXT,
    "additionType" TEXT,
    "addedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BatchIngredientAddition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchEvent" (
    "id" UUID NOT NULL,
    "batchId" UUID NOT NULL,
    "eventType" "EventType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BatchEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchMeasurement" (
    "id" UUID NOT NULL,
    "batchId" UUID NOT NULL,
    "measurementType" "MeasurementType" NOT NULL,
    "value" DECIMAL(10,3) NOT NULL,
    "unit" TEXT,
    "measuredAt" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BatchMeasurement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Ingredient_userId_idx" ON "Ingredient"("userId");

-- CreateIndex
CREATE INDEX "Ingredient_name_idx" ON "Ingredient"("name");

-- CreateIndex
CREATE INDEX "BatchIngredientAddition_batchId_idx" ON "BatchIngredientAddition"("batchId");

-- CreateIndex
CREATE INDEX "BatchIngredientAddition_ingredientId_idx" ON "BatchIngredientAddition"("ingredientId");

-- CreateIndex
CREATE INDEX "BatchEvent_batchId_idx" ON "BatchEvent"("batchId");

-- CreateIndex
CREATE INDEX "BatchEvent_occurredAt_idx" ON "BatchEvent"("occurredAt");

-- CreateIndex
CREATE INDEX "BatchMeasurement_batchId_idx" ON "BatchMeasurement"("batchId");

-- CreateIndex
CREATE INDEX "BatchMeasurement_measurementType_idx" ON "BatchMeasurement"("measurementType");

-- CreateIndex
CREATE INDEX "BatchMeasurement_measuredAt_idx" ON "BatchMeasurement"("measuredAt");

-- CreateIndex
CREATE INDEX "Batch_userId_idx" ON "Batch"("userId");

-- CreateIndex
CREATE INDEX "Batch_status_idx" ON "Batch"("status");

-- CreateIndex
CREATE INDEX "Batch_currentStage_idx" ON "Batch"("currentStage");

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchIngredientAddition" ADD CONSTRAINT "BatchIngredientAddition_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchIngredientAddition" ADD CONSTRAINT "BatchIngredientAddition_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchEvent" ADD CONSTRAINT "BatchEvent_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchMeasurement" ADD CONSTRAINT "BatchMeasurement_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
