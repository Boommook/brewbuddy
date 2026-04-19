// this file was mostly created by Cursor

import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

/*
  POST: upload a cover image
  this route is used to upload a cover image to the server
  the image is stored in the vercel blob storage
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

    const safeName = file.name.replace(/\s+/g, "-");
    const pathname = `batch-covers/${Date.now()}-${safeName}`;

    const blob = await put(pathname, file, {
      access: "public",
    });

    return NextResponse.json({ ok: true, url: blob.url, pathname: blob.pathname });

  } catch (error) {
    console.error("Failed to upload cover image", error);
    return NextResponse.json(
      { ok: false, error: "Failed to upload cover image" },
      { status: 500 }
    );
  }
}

