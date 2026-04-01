import { NextResponse } from "next/server";
import type { CreateBatchInput } from "../../../types/batch";
import {
  createNewBatch,
  getBatchesForDashboard,
  deleteBatch,
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
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  if (typeof body.name !== "string" || typeof body.category !== "string") {
    return NextResponse.json(
      { ok: false, error: "name and category are required" },
      { status: 400 }
    );
  }

  try {
    const created = await createNewBatch({
      name: body.name,
      category: body.category as CreateBatchInput["category"],
      meadSubtype: body.meadSubtype ?? null,
      thumbnailImageUrl: body.thumbnailImageUrl ?? null,
      startDate: body.startDate,
      targetVolume: body.targetVolume ?? undefined,
      actualVolume: body.actualVolume ?? undefined,
      status: body.status,
      currentStage: body.currentStage,
      brewDate: body.brewDate,
      originalGravity: body.originalGravity,
      notes: body.notes,
      additions: Array.isArray(body.additions) ? body.additions : undefined,
    } as CreateBatchInput);

    return NextResponse.json({ ok: true, batch: created });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create batch";
    const status =
      message === "User not found" || message === "Unauthorized" ? 401 : 400;
    return NextResponse.json(
      { ok: false, error: message },
      { status }
    );
  }
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  try {
    await deleteBatch(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Failed to delete batch" }, { status: 500 });
  }
}