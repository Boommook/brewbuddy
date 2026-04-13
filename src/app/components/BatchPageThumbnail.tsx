"use client";

import Image from "next/image";
import { SquarePen } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import ImageEdit from "./ImageEdit";

type Props = {
  batchId: string;
  imageUrl: string | null;
  alt: string;
  showLabel?: boolean;
  styles?: string;
  insetShadow?: boolean;
};

export default function BatchPageThumbnail({
  batchId,
  imageUrl,
  alt,
  showLabel = true,
  styles = "",
  insetShadow = false,
}: Props) {
  const router = useRouter();
  const [showImageEdit, setShowImageEdit] = useState(false);
  const [thumbnailSrc, setThumbnailSrc] = useState(
    () => imageUrl ?? "/img/default.jpg",
  );

  useEffect(() => {
    setThumbnailSrc(imageUrl ?? "/img/default.jpg");
  }, [batchId, imageUrl]);

  return (
    <div className={styles || undefined}>
      <div
        className={`relative overflow-hidden ${insetShadow ? " image-inset-shadow h-full w-full min-h-0" : ""}`}
      >
        <Image
          src={thumbnailSrc}
          alt={alt}
          width={1000}
          height={1000}
          className={
            `${styles.includes("rounded-t-xl") ? "rounded-t-xl" : ""} ${insetShadow ? "h-full w-full object-cover" : ""}`
          }
        />
        <Button
          type="button"
          size="icon"
          className="absolute top-2 right-2 edit-button"
          aria-label="Edit batch image"
          onClick={() => setShowImageEdit(true)}
        >
          <SquarePen className="size-4" aria-hidden />
        </Button>
        {showImageEdit ? (
          <ImageEdit
            batchId={batchId}
            setThumbnailImageUrl={(url) => setThumbnailSrc(url)}
            setShowImageEdit={setShowImageEdit}
            onSaved={() => router.refresh()}
          />
        ) : null}
      </div>
      {showLabel ? (
        <p className="rounded-b-lg border-t-2 table-label px-4 py-1 text-md font-semibold">
          Thumbnail
        </p>
      ) : null}
    </div>
  );
}
