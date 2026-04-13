import { getBatchName, updateBatchName } from "@/src/server/batches";
import { NextResponse } from "next/server";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }){
    try {
        const id = (await context.params).id;
        const batch = await getBatchName(id);
        return NextResponse.json({ ok: true, name: batch.name });
    } catch (e) {
        return NextResponse.json({ ok: false, error: "Failed to get batch name" }, { status: 500 });
    }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }){
    const id = (await context.params).id;
    const {name} = await req.json();
    try {
        const batchName = await updateBatchName(id, name);
        return NextResponse.json({ ok: true, batch: batchName });
    } catch (e) {
        return NextResponse.json({ ok: false, error: "Failed to update batch name" }, { status: 500 });
    }
}