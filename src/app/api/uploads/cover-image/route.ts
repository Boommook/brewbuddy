// this file was mostly created by Cursor

import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

/*
  POST: upload a cover image
  this route is used to upload a cover image to the server
  the image is stored in the public/img/batches folder
  the url is the path to the image
*/
export async function POST(req: Request) {
  // try to upload the cover image
  try {
    // get the form data from the request
    const formData = await req.formData();
    // get the file from the form data
    const file = formData.get("file");

    // check if the file is a file object
    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, error: "file field is required" },
        { status: 400 }
      );
    }

    // convert the file to an array buffer
    const arrayBuffer = await file.arrayBuffer(); // docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
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

