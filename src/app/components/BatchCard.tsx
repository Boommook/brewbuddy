import { BatchCardProps } from "../../types/index";
import {Star, EllipsisVertical} from "lucide-react";
import {Button} from "./ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
  } from "@/components/ui/tooltip"

export default function BatchCard({ title, type, image, stage, abv, favourite, createdAt, lastCheckedAt, OG, FG }: BatchCardProps) {
    
    const urgency = 7 - Math.floor((new Date().getTime() - lastCheckedAt.getTime()) / (1000 * 60 * 60 * 24));
    console.log(urgency);
    const borderColor = urgency > 0 ? urgency > 3 ? urgency > 5 ? "border-green-700" : "border-yellow-700" : "border-orange-700" : "border-red-700";
    const headerBg = urgency > 0 ? urgency > 3 ? urgency > 5 ? "bg-green-700/50" : "bg-yellow-600/50" : "bg-orange-600/50" : "bg-red-600/50";
    
    return (
    <div className="hover:cursor-pointer shadow-lg shadow-[#888] rounded-xl">
        <Tooltip>
            <TooltipTrigger className="block w-full text-left" asChild>
                <div className={`${headerBg} border-2 ${borderColor} rounded-t-lg backdrop-blur-lg px-4 py-2 flex justify-between items-center`}>
                    <div className="flex flex-col">
                        <h2 className="text-2xl text-white font-bold">{title}</h2>
                        <div className="text-lg text-gray-200 flex gap-2">
                            <Tooltip><TooltipTrigger asChild><p>{type}</p></TooltipTrigger><TooltipContent><p>The type of mead brewing.</p></TooltipContent></Tooltip>
                            <p> | </p>
                            <Tooltip><TooltipTrigger asChild><p>{stage}</p></TooltipTrigger><TooltipContent><p>The stage of fermentation.</p></TooltipContent></Tooltip>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Star className="w-6 h-6 text-white button-style" />
                        <EllipsisVertical className="w-6 h-6 text-white button-style" />
                    </div>
                </div>
            </TooltipTrigger>
            <TooltipContent>
                <p>Urgency: {urgency > 0 ? urgency > 3 ? urgency > 5 ? "Low" : "Medium" : "High" : "Critical"}</p>
            </TooltipContent>
        </Tooltip>
      
        <div className="relative overflow-hidden flex flex-col items-center justify-center border-l-2 border-r-2 border-gray-700 
        before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-4 before:bg-linear-to-b before:from-black/30 before:to-transparent after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-4 after:bg-linear-to-t after:from-black/30 after:to-transparent"
        >
            <img src={image} alt={title} className="w-full h-64 object-cover " />
        </div>

        <div className="flex flex-row bg-antique-white-200 border-2 gap-8 nunito-sans-regular justify-between border-antique-white-600  p-4 rounded-b-xl text-gray-800 items-end">
            <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold">ABV: {abv}%</h3>
                <div className="flex gap-2">
                    <p>OG: {OG}</p>
                    <p>|</p>
                    <p>FG: {FG}</p>
                </div>

                <p>Last Checked: {7 - urgency} days ago on {lastCheckedAt.toLocaleDateString()}</p>
            </div>
            <Button variant="outline" className=" bg-bright-blue hover:bg-bright-blue-700 border-none text-gray-200 hover:text-gray-230 rounded-full text-lg px-4 py-3
            shadow-md shadow-[#888] button-style">
                <p>Add Log</p>
            </Button>
        </div>
    </div>
  );
}