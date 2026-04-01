import "server-only";

import { prisma } from "../lib/prisma";
import { getUserId } from "./auth";
import type { CreateBatchAdditionPayload } from "../types/batch";
import { normalizeAdditions } from "./batches";
import {
  EventType,
  type MeasurementType,
} from "../generated/prisma/index.js";

async function requireOwnedBatch(batchId: string, userId: string) {
  const batch = await prisma.batch.findFirst({
    where: { id: batchId, userId },
    select: { id: true },
  });
  if (!batch) {
    const exists = await prisma.batch.findFirst({
      where: { id: batchId },
      select: { id: true },
    });
    if (!exists) throw new Error("Batch not found");
    throw new Error("Unauthorized");
  }
}

export async function createBatchMeasurementLog(input: {
  batchId: string;
  measurementType: MeasurementType;
  value: number;
  unit?: string | null;
  measuredAt: Date;
  note?: string | null;
}) {
  const userId = await getUserId();
  if (!userId) throw new Error("User not found");

  await requireOwnedBatch(input.batchId, userId);

  if (!Number.isFinite(input.value)) {
    throw new Error("Measurement value must be a number");
  }

  const measurement = await prisma.$transaction(async (tx) => {
    const m = await tx.batchMeasurement.create({
      data: {
        batchId: input.batchId,
        measurementType: input.measurementType,
        value: input.value,
        unit: input.unit ?? null,
        measuredAt: input.measuredAt,
        note: input.note ?? null,
      },
    });
    await tx.batch.update({
      where: { id: input.batchId },
      data: { updatedAt: new Date() },
    });
    return m;
  });

  return measurement;
}

export async function createBatchEventLog(input: {
  batchId: string;
  eventType: EventType;
  title: string;
  description?: string | null;
  occurredAt: Date;
  additions?: CreateBatchAdditionPayload[] | undefined;
}) {
  const userId = await getUserId();
  if (!userId) throw new Error("User not found");

  await requireOwnedBatch(input.batchId, userId);

  const title = input.title.trim();
  if (!title) throw new Error("Title is required for batch events");

  const allowsIngredients =
    input.eventType === EventType.STABILIZED ||
    input.eventType === EventType.BACKSWEETENED;

  const rawAdds = input.additions;
  if (
    !allowsIngredients &&
    Array.isArray(rawAdds) &&
    rawAdds.length > 0
  ) {
    throw new Error(
      "Ingredients can only be logged with stabilization or backsweetening"
    );
  }

  const additions = allowsIngredients
    ? normalizeAdditions(
        Array.isArray(rawAdds) ? (rawAdds as CreateBatchAdditionPayload[]) : undefined
      )
    : [];

  const event = await prisma.$transaction(async (tx) => {
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

    const e = await tx.batchEvent.create({
      data: {
        batchId: input.batchId,
        eventType: input.eventType,
        title,
        description: input.description?.trim() || null,
        occurredAt: input.occurredAt,
      },
    });

    if (additions.length > 0) {
      await tx.batchIngredientAddition.createMany({
        data: additions.map((a) => ({
          batchId: input.batchId,
          ingredientId: a.ingredientId ?? null,
          customIngredientName: a.customIngredientName ?? null,
          amount: a.amount,
          unit: a.unit,
          purpose: a.purpose ?? null,
          notes: a.notes ?? null,
          addedAt: input.occurredAt,
        })),
      });
    }

    await tx.batch.update({
      where: { id: input.batchId },
      data: { updatedAt: new Date() },
    });
    return e;
  });

  return event;
}
