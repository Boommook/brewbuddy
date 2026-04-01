// this file was mostly created by Cursor

import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "file field is required" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadsDir = path.join(process.cwd(), "public", "img", "batches");
    await fs.mkdir(uploadsDir, { recursive: true });

    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const timestamp = Date.now();
    const filename = `${timestamp}_${safeName}`;
    const filePath = path.join(uploadsDir, filename);

    await fs.writeFile(filePath, buffer);

    const urlPath = `/img/batches/${filename}`;

    return NextResponse.json({ ok: true, url: urlPath });
  } catch (error) {
    console.error("Failed to upload cover image", error);
    return NextResponse.json(
      { ok: false, error: "Failed to upload cover image" },
      { status: 500 }
    );
  }
}

