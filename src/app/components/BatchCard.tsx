"use client";
import { BatchCardProps } from "../../types/index";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";
import { useState } from "react";
import { useRouter } from "next/navigation";
import BatchPageThumbnail from "./BatchPageThumbnail";
import FavoriteButton from "./buttons/FavoriteButton";
import TrashButton from "./buttons/TrashButton";

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
          ? "bg-green-700/60"
          : "bg-yellow-600/60"
        : "bg-orange-600/60"
      : "bg-red-600/60";

  return (
    <div className="hover:cursor-pointer w-[30vw] shadow-lg shadow-black/30 rounded-xl">
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
              <FavoriteButton id={id} />
              <TrashButton id={id} />
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
        className="relative overflow-hidden flex flex-col items-center justify-center border-l-2 border-r-2 border-golden-orange-700">
        <BatchPageThumbnail
          batchId={id}
          imageUrl={thumbnailImageUrl}
          alt={title}
          showLabel={false}
          styles="h-64 w-full"
          insetShadow
        />
      </div>

      <div className="flex flex-row bg-camel/75 backdrop-blur-sm border-2 gap-8 nunito-sans-regular justify-between
       border-golden-orange-700 p-4 rounded-b-xl text-harvest-orange-900 items-end hover:cursor-default">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold">ABV: {abv}%</h3>
          <div className="flex gap-2">
            <p>OG: {OG}</p>
            <p>|</p>
            <p>SG: {FG}</p>
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
