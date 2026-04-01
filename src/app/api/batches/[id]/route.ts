import { NextResponse } from "next/server";
import { deleteBatch, updateBatchFavorite } from "@/src/server/batches";

export async function PUT(req: Request){
  const {id} = await req.json();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }

  const isFavorite =
    typeof body === "object" &&
    body !== null &&
    "isFavorite" in body &&
    typeof (body as { isFavorite: unknown }).isFavorite === "boolean"
      ? (body as { isFavorite: boolean }).isFavorite
      : undefined;


  if (isFavorite === undefined) {
    return NextResponse.json(
      { ok: false, error: "isFavorite boolean is required" },
      { status: 400 }
    );
  }

  try {
    const batch = await updateBatchFavorite(id, isFavorite);
    return NextResponse.json({ ok: true, batch });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to update batch";
    const status =
      message === "User not found" || message === "Unauthorized"
        ? 401
        : message === "Batch not found"
          ? 404
          : 400;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

export async function DELETE(req: Request){
  const {id} = await req.json();
  try {
    await deleteBatch(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to delete batch";
    const status =
      message === "User not found" || message === "Unauthorized"
        ? 401
        : message === "Batch not found"
          ? 404
          : 400;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}