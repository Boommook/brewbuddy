  "use client";

  import { useState } from "react";
  import { Input } from "./ui/input";
  import { Button } from "./ui/button";

  interface ImageEditProps {
      batchId: string;
      setThumbnailImageUrl: (url: string) => void;
      setShowImageEdit: (show: boolean) => void;
      onSaved?: () => void;
  }

  export default function ImageEdit({ batchId, setThumbnailImageUrl, setShowImageEdit, onSaved }: ImageEditProps) {
      const [coverImage, setCoverImage] = useState<File | null>(null);
      const [formError, setFormError] = useState<string | null>(null);
      const [submitting, setSubmitting] = useState(false);

      const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          setFormError(null);
          setSubmitting(true);
          if(!coverImage) {
              setFormError("Please select an image");
              setSubmitting(false);
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
              setThumbnailImageUrl(data.url);

              const thumbRes = await fetch(`/api/batches/${batchId}/thumbnail`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: batchId, thumbnailImageUrl: data.url })
              });
              const thumbJson = (await thumbRes.json().catch(() => ({}))) as {
                  ok?: boolean;
                  error?: string;
              };
              if (!thumbRes.ok || !thumbJson?.ok) {
                  throw new Error(thumbJson?.error ?? "Failed to save thumbnail");
              }
              onSaved?.();
              setShowImageEdit(false);
          } catch (error) {
              setFormError(error instanceof Error ? error.message : "Failed to upload cover image");
              setCoverImage(null);
          } finally {
              setSubmitting(false);
          }
      }

      return (
          <div
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/60"
            onClick={(e) => e.stopPropagation()}
          >
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 bg-camel-400/95 px-4 py-3 rounded-lg shadow-lg"
            >
              <label className="flex flex-col gap-1 items-center">
                <span className="text-sm font-semibold text-gray-800">
                  Cover image
                </span>
                {formError && <p className="text-red-500">{formError}</p>}
                {coverImageUrl && (
                  <img
                    src={coverImageUrl}
                    alt="Cover image"
                    className="w-1/2 border-2 border-antique-white-600 rounded-md"
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
              <div className="flex justify-between gap-4">
                <Button
                  type="submit"
                  className="save-button w-[40%]"
                >
                  {submitting ? "Saving..." : "Save"}
                </Button>
                <Button
                  type="button"
                  className="shadow-style bg-cayenne-red w-[40%] hover:bg-cayenne-red-700 button-style border-2 border-cayenne-red-600 hover:border-cayenne-red-800"
                  disabled={submitting}
                  onClick={() => setShowImageEdit(false)}>
                  Cancel

                </Button>
              </div>
            </form>
          </div>
      )
  }