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

    // convert the file to an array buffer to handle the file data
    const arrayBuffer = await file.arrayBuffer(); // docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer
    const buffer = Buffer.from(arrayBuffer);
    // create the uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "img", "batches");
    await fs.mkdir(uploadsDir, { recursive: true });
    // create a safe name for the file by replacing any invalid characters with an underscore
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    // create a timestamp for the file using the current date and time
    const timestamp = Date.now();
    // create a filename for the file using the timestamp and safe name
    const filename = `${timestamp}_${safeName}`;
    // create a file path for the file using the uploads directory and filename
    const filePath = path.join(uploadsDir, filename);

    // write the file to the file path
    await fs.writeFile(filePath, buffer);

    // create a url path for the file using the uploads directory and filename
    const urlPath = `/img/batches/${filename}`;
    // return the url path as a json response
    return NextResponse.json({ ok: true, url: urlPath });
  } catch (error) {
    console.error("Failed to upload cover image", error);
    return NextResponse.json(
      { ok: false, error: "Failed to upload cover image" },
      { status: 500 }
    );
  }
}

