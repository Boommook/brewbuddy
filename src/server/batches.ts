import "server-only";

import { prisma } from "../lib/prisma";
import { getUserId } from "./auth";
import {
  BatchStatus,
  BatchStage,
  BrewCategory,
  EventType,
} from "../generated/prisma/index.js";
import type { CreateBatchAdditionPayload, CreateBatchInput } from "../types/batch";
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
  });

  return batches.map((b) => toBatchDTO(b));
}

export async function deleteBatch(batchId: string){
  const userId = await getUserId();
  if(!userId) throw new Error("User not found");

  const deletedBatch = await prisma.batch.delete({
    where: {
      id: batchId,
      userId
    }
  });

  if(!deletedBatch) throw new Error("Batch not found");

  return deletedBatch;
}

export async function getBatchSummaryForUser(batchId: string) {
  const userId = await getUserId();
  if (!userId) return null;

  return prisma.batch.findFirst({
    where: { id: batchId, userId },
    select: { id: true, name: true, thumbnailImageUrl: true },
  });
}

type BatchPatch = {
  isFavorite?: boolean;
  thumbnailImageUrl?: string | null;
};

export async function updateBatch(batchId: string, patch: BatchPatch) {
  const userId = await getUserId();
  if (!userId) throw new Error("User not found");

  const data: { isFavorite?: boolean; thumbnailImageUrl?: string | null } = {};
  if (patch.isFavorite !== undefined) data.isFavorite = patch.isFavorite;
  if (patch.thumbnailImageUrl !== undefined)
    data.thumbnailImageUrl = patch.thumbnailImageUrl;

  if (Object.keys(data).length === 0) {
    throw new Error("No fields to update");
  }

  const updated = await prisma.batch.updateMany({
    where: { id: batchId, userId },
    data,
  });

  if (updated.count === 0) {
    const exists = await prisma.batch.findFirst({
      where: { id: batchId },
      select: { id: true },
    });
    if (!exists) throw new Error("Batch not found");
    throw new Error("Unauthorized");
  }

  const batch = await prisma.batch.findFirstOrThrow({
    where: { id: batchId, userId },
  });
  return toBatchDTO(batch);
}

export async function updateBatchFavorite(batchId: string, isFavorite: boolean) {
  return updateBatch(batchId, { isFavorite });
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

  const additions = normalizeAdditions(input.additions);

  const batch = await prisma.$transaction(async (tx) => {
    for (const a of additions) {
      if (a.ingredientId) {
        const ing = await tx.ingredient.findFirst({
          where: {
            id: a.ingredientId,
            isArchived: false,
            OR: [{ isGlobal: true }, { userId }],
          },
        });
        if (!ing) {
          throw new Error("Invalid ingredient selection");
        }
      }
    }

    // Build data object separately so we can keep type narrowing clear.
    const data: any = {
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
      thumbnailImageUrl: input.thumbnailImageUrl ?? undefined,
    };

    if (input.category === BrewCategory.MEAD && input.meadSubtype) {
      data.meadSubtype = input.meadSubtype;
    }

    const created = await tx.batch.create({
      data,
    });

    await tx.batchEvent.create({
      data: {
        batchId: created.id,
        eventType: EventType.CREATED,
        title: "Batch created",
        description: null,
        occurredAt: startDate,
      },
    });

    if (additions.length > 0) {
      await tx.batchIngredientAddition.createMany({
        data: additions.map((a) => ({
          batchId: created.id,
          ingredientId: a.ingredientId ?? null,
          customIngredientName: a.customIngredientName ?? null,
          amount: a.amount,
          unit: a.unit,
          purpose: a.purpose ?? null,
          notes: a.notes ?? null,
          addedAt: startDate,
        })),
      });
    }

    return created;
  });

  return toBatchDTO(batch);
}

export function normalizeAdditions(
  raw: CreateBatchAdditionPayload[] | undefined
): CreateBatchAdditionPayload[] {
  if (!raw?.length) return [];

  const out: CreateBatchAdditionPayload[] = [];
  for (const a of raw) {
    const unit = typeof a.unit === "string" ? a.unit.trim() : "";
    const custom =
      typeof a.customIngredientName === "string"
        ? a.customIngredientName.trim()
        : "";
    const hasIngredient =
      typeof a.ingredientId === "string" && a.ingredientId.length > 0;
    const amount = Number(a.amount);

    if (!hasIngredient && !custom) continue;
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Each ingredient line needs a positive amount");
    }
    if (!unit) {
      throw new Error("Each ingredient line needs a unit");
    }
    if (hasIngredient && custom) {
      throw new Error("Use either a catalog ingredient or a custom name, not both");
    }

    out.push({
      ingredientId: hasIngredient ? a.ingredientId! : null,
      customIngredientName: custom || null,
      amount,
      unit,
      purpose:
        typeof a.purpose === "string" && a.purpose.trim()
          ? a.purpose.trim()
          : null,
      notes:
        typeof a.notes === "string" && a.notes.trim() ? a.notes.trim() : null,
    });
  }
  return out;
}

