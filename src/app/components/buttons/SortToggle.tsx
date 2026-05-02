import { Button } from "../ui/button";
import { CalendarArrowUp, CalendarArrowDown } from "lucide-react";
import {Tooltip, TooltipContent, TooltipTrigger} from "../ui/tooltip";

type Props = {
    sort: "newest" | "oldest";
    setSort: (sort: "newest" | "oldest") => void;
}

export default function SortToggle({ sort, setSort }: Props) {
    return (
        <Tooltip>
            <TooltipTrigger>
                <Button onClick={() => setSort(sort === "newest" ? "oldest" : "newest")}
                    className="button-style shadow-style bg-harvest-orange-600 hover:bg-harvest-orange-700 border-2 border-cayenne-red-700 hover:border-cayenne-red-800 text-antique-white-100">
                    {sort === "newest" ? <CalendarArrowUp className="size-4" /> : <CalendarArrowDown className="size-4" />}
                </Button>        
            </TooltipTrigger>
            <TooltipContent>
                <p>Sorting by {sort === "newest" ? "oldest" : "newest"}</p>
            </TooltipContent>
        </Tooltip>
    )
}