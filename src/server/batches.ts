import "server-only";

import { prisma } from "../lib/prisma";
import { getUserId } from "./auth";
import { BatchStatus, BatchStage } from "../generated/prisma/index.js";
import type { CreateBatchInput } from "../types/batch";
import { toBatchDTO } from "../lib/utils/batch";

export async function getBatchesForDashboard() {
  const userId = await getUserId();
  if (!userId) throw new Error("User not found");

  const batches = await prisma.batch.findMany({
    where: {
      userId,
      status: BatchStatus.ACTIVE,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      userId: true,
      name: true,
      category: true,
      status: true,
      currentStage: true,
      startDate: true,
      brewDate: true,
      completedDate: true,
      targetVolume: true,
      actualVolume: true,
      originalGravity: true,
      finalGravity: true,
      calculatedABV: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return batches.map((b) => toBatchDTO(b));
}

export async function createNewBatch(input: CreateBatchInput) {
  const userId = await getUserId();
  if (!userId) throw new Error("User not found");

  const startDate = input.startDate ? new Date(input.startDate) : new Date();
  if (Number.isNaN(startDate.getTime())) {
    throw new Error("Invalid startDate");
  }

  const brewDate =
    input.brewDate === undefined
      ? undefined
      : input.brewDate === null
        ? null
        : new Date(input.brewDate);

  if (brewDate instanceof Date && Number.isNaN(brewDate.getTime())) {
    throw new Error("Invalid brewDate");
  }

  const batch = await prisma.batch.create({
    data: {
      userId,
      name: input.name,
      category: input.category,
      status: input.status ?? BatchStatus.ACTIVE,
      currentStage: input.currentStage ?? BatchStage.PRIMARY,
      startDate,
      brewDate,
      notes: input.notes ?? undefined,
      targetVolume: input.targetVolume ?? undefined,
      actualVolume: input.actualVolume ?? undefined,
      originalGravity: input.originalGravity ?? undefined,
    },
  });

  return toBatchDTO(batch);
}

