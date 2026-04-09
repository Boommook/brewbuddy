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
};

export default function BatchPageThumbnail({ batchId, imageUrl, alt }: Props) {
  const router = useRouter();
  const [showImageEdit, setShowImageEdit] = useState(false);
  const [thumbnailSrc, setThumbnailSrc] = useState(
    () => imageUrl ?? "/img/default.jpg",
  );

  useEffect(() => {
    setThumbnailSrc(imageUrl ?? "/img/default.jpg");
  }, [batchId, imageUrl]);

  return (
    <div className="flex flex-col rounded-xl border-2 border-golden-orange-700 shadow-style">
      <div className="relative">
        <Image
          src={thumbnailSrc}
          alt={alt}
          width={1000}
          height={1000}
          className="rounded-t-xl"
        />
        <Button
          type="button"
          size="icon"
          className="absolute top-2 right-2 size-10 rounded-full button-style bg-bright-blue hover:bg-bright-blue-700 text-antique-white"
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
      <p className="rounded-b-xl border-t-2 border-golden-orange-700 bg-golden-orange-100/60 px-3 py-2 text-md font-semibold">
        Thumbnail
      </p>
    </div>
  );
}
