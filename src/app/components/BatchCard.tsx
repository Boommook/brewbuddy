"use client";
import Image from "next/image";
import { BatchCardProps } from "../../types/index";
import { Star, EllipsisVertical, SquarePen, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./ui/popover"
import ImageEdit from "./ImageEdit";

export default function BatchCard({
  id,
  title,
  type,
  image,
  stage,
  abv,
  favourite,
  lastCheckedAt,
  OG,
  FG,
}: BatchCardProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(favourite);
  const [showImageEdit, setShowImageEdit] = useState(false);
  const [thumbnailImageUrl, setThumbnailImageUrl] = useState(image);
  
  const urgency =
    7 -
    Math.floor(
      (new Date().getTime() - lastCheckedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
  const borderColor =
    urgency > 0
      ? urgency > 3
        ? urgency > 5
          ? "border-green-700"
          : "border-yellow-700"
        : "border-orange-700"
      : "border-red-700";
  const headerBg =
    urgency > 0
      ? urgency > 3
        ? urgency > 5
          ? "bg-green-700/50"
          : "bg-yellow-600/50"
        : "bg-orange-600/50"
      : "bg-red-600/50";

  const handleFavorite = () => {
    const next = !isFavorite;
    setIsFavorite(next);
    fetch(`/api/batches/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: next }),
    })
      .then(async (res) => {
        if (!res.ok) {
          setIsFavorite(!next);
          return;
        }
        await res.json();
        router.refresh();
      })
      .catch(() => setIsFavorite(!next));
  };

  const handleDelete = () => {
    fetch(`/api/batches/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    .then(() => router.refresh());
  };

  return (
    <div className="hover:cursor-pointer w-[30vw] shadow-style rounded-xl">
      <Tooltip>
        <TooltipTrigger
          className="block w-full cursor-default text-left"
          // render is a prop that allows you to replace the component's HTML element with a different tag, or compose it with another component.
          render={(props) => <div {...props} />}
        >
          <div
            className={`${headerBg} border-2 ${borderColor} rounded-t-lg backdrop-blur-lg px-4 py-2 flex justify-between items-center`}
          >
            <div className="flex flex-col">
              <h2 className="text-2xl text-white font-bold">{title}</h2>
              <div className="text-lg text-gray-200 flex gap-2">
                <Tooltip>
                  <TooltipTrigger>
                    <p className="uppercase">{type}</p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The type of mead brewing.</p>
                  </TooltipContent>
                </Tooltip>
                <p> | </p>
                <Tooltip>
                  <TooltipTrigger>
                    <p>{stage}</p>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The stage of fermentation.</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                className="bg-transparent border-none text-gray-200 hover:text-gray-230 rounded-full
                 button-style hover:bg-transparent hover:border-none p-0"
                onClick={handleFavorite}
              >
                <Star
                  className={`size-6 text-white ${isFavorite ? "fill-yellow-500" : ""}`}
                />
              </Button>

              <Button variant="outline" className="bg-transparent border-none text-gray-200 rounded-full
                 button-style hover:bg-transparent hover:border-none p-0 hover:text-red-700"
                 onClick={handleDelete}
                 >
                <Trash2 className="size-6 " />
              </Button>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            Urgency:{" "}
            {urgency > 0
              ? urgency > 3
                ? urgency > 5
                  ? "Low"
                  : "Medium"
                : "High"
              : "Critical"}
          </p>
        </TooltipContent>
      </Tooltip>

      <div
        className="relative overflow-hidden flex flex-col items-center justify-center border-l-2 border-r-2 border-antique-white-600 
        before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-4 before:bg-linear-to-b before:from-black/30 before:to-transparent after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-4 after:bg-linear-to-t after:from-black/30 after:to-transparent"
        onClick={() => router.push(`/batches/${id}/log`)}
      >
        <Image
          src={thumbnailImageUrl}
          alt={title}
          // just use a large value as placeholder
          width={1000}
          height={1000}
          // specify the actual size (h of 64 and w fills width)
          className="h-64 w-full object-cover"
        />
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute top-2 right-2 size-9 rounded-full button-style bg-bright-blue hover:bg-bright-blue-700 text-antique-white"
          aria-label="Edit cover image"
          onClick={(e) => {
            e.stopPropagation();
            setShowImageEdit(true);
          }}
        >
          <SquarePen className="size-4" aria-hidden />
        </Button>
        {showImageEdit && <ImageEdit batchId={id} setThumbnailImageUrl={setThumbnailImageUrl} setShowImageEdit={setShowImageEdit} />}
      </div>

      <div className="flex flex-row bg-camel/75 backdrop-blur-sm border-2 gap-8 nunito-sans-regular justify-between
       border-antique-white-600 p-4 rounded-b-xl text-harvest-orange-900 items-end">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold">ABV: {abv}%</h3>
          <div className="flex gap-2">
            <p>OG: {OG}</p>
            <p>|</p>
            <p>FG: {FG}</p>
          </div>

          <p className="text-xs">
            Last Checked: {7 - urgency} days ago on{" "}
            {lastCheckedAt.toLocaleDateString()}
          </p>
        </div>
        <div className="flex flex-col gap-4">
        <Button
          type="button"
          variant="outline"
          className=" bg-cayenne-red-600 hover:bg-cayenne-red-700 border-2 hover:border-cayenne-red-800 border-cayenne-red-700 text-golden-orange-200 hover:text-gray-230 rounded-lg text-lg px-4 py-3
            shadow-style button-style"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/batches/${id}/log`);
          }}
        >
          <p className="text-style">Add Log</p>
        </Button>
        <Button
          type="button"
          variant="outline"
          className=" bg-cayenne-red-600 hover:bg-cayenne-red-700 border-2 hover:border-cayenne-red-800 border-cayenne-red-700 text-golden-orange-200 hover:text-gray-230 rounded-lg text-lg px-4 py-3
            shadow-style button-style"
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/batches/${id}`);
          }}
        >
          <p className="text-style">View Batch</p>
        </Button>
        </div>
        
      </div>
    </div>
  );
}
