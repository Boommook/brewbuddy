import { NextResponse } from "next/server";
import type { CreateBatchInput } from "../../../types/batch";
import {
  createNewBatch,
  getBatchesForDashboard,
} from "../../../server/batches";

export async function GET() {
  try {
    const batches = await getBatchesForDashboard();
    return NextResponse.json({ ok: true, batches });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
}

export async function POST(req: Request) {
  let body: Partial<CreateBatchInput>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.name !== "string" || typeof body.category !== "string") {
    return NextResponse.json(
      { error: "name and category are required" },
      { status: 400 }
    );
  }

  try {
    const created = await createNewBatch({
      name: body.name,
      category: body.category as any,
      startDate: body.startDate,
      targetVolume: body.targetVolume ?? undefined,
      actualVolume: body.actualVolume ?? undefined,
      status: body.status,
      currentStage: body.currentStage,
      brewDate: body.brewDate,
      originalGravity: body.originalGravity,
      notes: body.notes,
    } as CreateBatchInput);

    return NextResponse.json({ ok: true, batch: created });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create batch" },
      { status: 400 }
    );
  }
}
