import { BatchCardProps } from "../../types/index";
import {Star, EllipsisVertical} from "lucide-react";

export default function BatchCard({ title, type, image, stage, abv, favourite, createdAt, lastCheckedAt, OG, FG }: BatchCardProps) {
    
    const urgency = 7 - Math.floor((new Date().getTime() - lastCheckedAt.getTime()) / (1000 * 60 * 60 * 24));
    console.log(urgency);
    
    const headerBg = urgency > 0 ? urgency > 3 ? urgency > 5 ? "bg-green-700/50" : "bg-yellow-700" : "bg-orange-700" : "bg-red-700";
  
    return (
    <div className="hover:cursor-pointer shadow-md rounded-xl">
        <div className={`${headerBg} rounded-t-lg px-4 py-2 flex justify-between items-center`}>
            <div className="flex flex-col">
            <h2 className={`text-xl font-bold`}>{title}</h2>
            <p className="text-sm text-gray-200">{type} | {stage}</p>
            </div>
            <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-white" />
                <EllipsisVertical className="w-6 h-6 text-white" />
            </div>
        </div>
      
        <div className="flex flex-col items-center justify-center">
            <img src={image} alt={title} className="w-fit h-fit object-cover " />
        </div>

        <div className="flex flex-row bg-antique-white-200 border-t-2 justify-between border-antique-white-600  p-4 rounded-b-xl text-gray-800">
            <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold">ABV: {abv}%</h3>
                <div className="flex gap-2">
                    <p>OG: {OG}</p>
                    <p>|</p>
                    <p>FG: {FG}</p>
                </div>

                <p>Last Checked: {lastCheckedAt.toLocaleDateString()}</p>
            </div>
            
        </div>
    </div>
  );
}