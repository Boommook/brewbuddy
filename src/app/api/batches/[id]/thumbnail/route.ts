import { NextResponse } from "next/server";
import { updateBatchThumbnail } from "@/src/server/batches";

export async function PUT(req: Request){
    const {id, thumbnailImageUrl} = await req.json();
    if (thumbnailImageUrl === undefined) {
        return NextResponse.json(
        { ok: false, error: "thumbnailImageUrl string is required" },
        { status: 400 }
        );
    }

    try {
    const batch = await updateBatchThumbnail(id, thumbnailImageUrl);
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