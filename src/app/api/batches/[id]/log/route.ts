import { NextResponse } from "next/server";
import {
  createBatchEventLog,
  createBatchMeasurementLog,
} from "@/src/server/batchLogs";
import {
  BatchStage,
  EventType,
  MeasurementType,
} from "@/src/generated/prisma/index.js";
import type { CreateBatchAdditionPayload } from "@/src/types/batch";

const MEASUREMENT_TYPES = new Set<string>(Object.values(MeasurementType));
const EVENT_TYPES = new Set<string>(Object.values(EventType));
const BATCH_STAGES = new Set<string>(Object.values(BatchStage));

function parseDate(value: unknown, label: string): Date {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} is required`);
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid ${label}`);
  }
  return d;
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: batchId } = await context.params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { ok: false, error: "Invalid body" },
      { status: 400 }
    );
  }

  const kind = (body as { kind?: unknown }).kind;

  try {
    if (kind === "measurement") {
      const measurementType = (body as { measurementType?: unknown })
        .measurementType;
      const valueRaw = (body as { value?: unknown }).value;
      const unit =
        typeof (body as { unit?: unknown }).unit === "string"
          ? (body as { unit: string }).unit.trim() || null
          : null;
      const note =
        typeof (body as { note?: unknown }).note === "string"
          ? (body as { note: string }).note.trim() || null
          : null;
      const measuredAtRaw = (body as { measuredAt?: unknown }).measuredAt;

      if (
        typeof measurementType !== "string" ||
        !MEASUREMENT_TYPES.has(measurementType)
      ) {
        return NextResponse.json(
          { ok: false, error: "Invalid measurementType" },
          { status: 400 }
        );
      }

      const value =
        typeof valueRaw === "number"
          ? valueRaw
          : typeof valueRaw === "string"
            ? Number(valueRaw)
            : NaN;

      const measuredAt = parseDate(measuredAtRaw, "measuredAt");

      const row = await createBatchMeasurementLog({
        batchId,
        measurementType: measurementType as MeasurementType,
        value,
        unit,
        measuredAt,
        note,
      });

      return NextResponse.json({
        ok: true,
        measurement: {
          id: row.id,
          batchId: row.batchId,
          measurementType: row.measurementType,
          value: row.value.toString(),
          unit: row.unit,
          measuredAt: row.measuredAt.toISOString(),
          note: row.note,
          createdAt: row.createdAt.toISOString(),
        },
      });
    }

    if (kind === "event") {
      const eventType = (body as { eventType?: unknown }).eventType;
      const titleRaw = (body as { title?: unknown }).title;
      const description =
        typeof (body as { description?: unknown }).description === "string"
          ? (body as { description: string }).description
          : null;
      const occurredAtRaw = (body as { occurredAt?: unknown }).occurredAt;
      const additionsRaw = (body as { additions?: unknown }).additions;
      const newStageRaw = (body as { newStage?: unknown }).newStage;

      if (typeof eventType !== "string" || !EVENT_TYPES.has(eventType)) {
        return NextResponse.json(
          { ok: false, error: "Invalid eventType" },
          { status: 400 }
        );
      }

      if (eventType === EventType.CREATED) {
        return NextResponse.json(
          { ok: false, error: "Cannot log CREATED events manually" },
          { status: 400 }
        );
      }

      const title =
        typeof titleRaw === "string" ? titleRaw : titleRaw == null ? "" : "";

      const occurredAt = parseDate(occurredAtRaw, "occurredAt");

      const additions: CreateBatchAdditionPayload[] | undefined =
        Array.isArray(additionsRaw)
          ? (additionsRaw as CreateBatchAdditionPayload[])
          : undefined;

      let newStage: BatchStage | null = null;
      if (typeof newStageRaw === "string" && newStageRaw.trim()) {
        if (!BATCH_STAGES.has(newStageRaw)) {
          return NextResponse.json(
            { ok: false, error: "Invalid newStage" },
            { status: 400 }
          );
        }
        newStage = newStageRaw as BatchStage;
      }

      const row = await createBatchEventLog({
        batchId,
        eventType: eventType as EventType,
        title,
        description,
        occurredAt,
        additions,
        newStage,
      });

      return NextResponse.json({
        ok: true,
        event: {
          id: row.id,
          batchId: row.batchId,
          eventType: row.eventType,
          title: row.title,
          description: row.description,
          occurredAt: row.occurredAt.toISOString(),
          createdAt: row.createdAt.toISOString(),
        },
      });
    }

    return NextResponse.json(
      { ok: false, error: 'kind must be "measurement" or "event"' },
      { status: 400 }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to save log";
    const status =
      message === "User not found" || message === "Unauthorized"
        ? 401
        : message === "Batch not found"
          ? 404
          : 400;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
