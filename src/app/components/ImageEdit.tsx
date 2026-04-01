import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export default function ImageEdit() {
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        if(!coverImage) {
            setFormError("Please select an image");
            return;
        }

        const formData = new FormData();
        formData.append("file", coverImage);

        try {
            const res = await fetch("/api/uploads/cover-image", {
                method: "POST",
                body: formData
            });

            const data = await res.json();
            if(!res.ok || !data?.ok || typeof data.url !== "string") {
                throw new Error("Failed to upload cover image");
            }
            setCoverImageUrl(data.url);
        } catch (error) {
            setFormError(error instanceof Error ? error.message : "Failed to upload cover image");
            setCoverImage(null);
            setCoverImageUrl(null);
        }
    }

    return (
        <div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
           <label className="flex flex-col gap-1 items-center">
            <span className="text-sm font-semibold text-gray-800">
              Cover image
            </span>
            {formError && <p className="text-red-500">{formError}</p>}
            {coverImageUrl && (
              <img
                src={coverImageUrl}
                alt="Cover image"
                className="w-[50%] border-2 border-antique-white-600 rounded-md"
              />
            )}
            <Input
              type="file"
              className="bg-gray-100 h-fit shadow-md hover:bg-gray-300 rounded-md border-2 hover:cursor-pointer border-gray-500 w-fit"
              accept="image/*"
              onChange={(e) => setCoverImage(e.target.files?.[0] ?? null)}
              placeholder="e.g. cover-image.jpg"
              autoComplete="off"
            />
          </label> 
          <Button type="submit" className="bg-golden-orange-600 hover:bg-golden-orange-700 border-none text-white shadow-style button-style">
            Save
          </Button>
          </form>
          
        </div>
    )
}