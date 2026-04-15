"use client";

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "./ui/select"
import type { DashboardSort } from "./DashboardSortContext";
import {
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./ui/popover"

const sortItems = [
    { label: "Most Urgent", value: "mostUrgent" },
    { label: "Least Urgent", value: "leastUrgent" },
    { label: "Name A-Z", value: "nameAZ" },
    { label: "Name Z-A", value: "nameZA" },
    { label: "Newest", value: "newest" },
    { label: "Oldest", value: "oldest" },
  ]
  

export function DashboardFilterPopoverContent({
  selectedSort,
  setSelectedSort,
}: {
  selectedSort: DashboardSort;
  setSelectedSort: (sort: DashboardSort) => void;
}) {
  return (
      <PopoverContent className="w-64 bg-golden-orange-200/75 backdrop-blur-sm border-2 border-golden-orange-700" align="center">
        <PopoverHeader>
          <PopoverTitle>Sort Batches</PopoverTitle>
          <PopoverDescription className="nunito-sans-regular text-gray-700 text-xs">
            Order the batches by the following criteria. Note that favorited batches are always at the top of the list.
          </PopoverDescription>
        </PopoverHeader>
        <Select
          items={sortItems}
          value={selectedSort}
          onValueChange={(value) =>
            setSelectedSort((value ?? "mostUrgent") as DashboardSort)
          }
        >
      <SelectTrigger className="w-full max-w-48 hover:cursor-pointer auth-input-style">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-golden-orange-100/75 p-0 m-0 backdrop-blur-sm border-2 border-golden-orange-700">
        <SelectGroup className="p-0 m-0">
          <SelectLabel className="font-semibold text-black text-sm border-b-2 bg-harvest-orange/75 p-2 m-0 border-camel-400">Sort By</SelectLabel>
          {sortItems.map((item) => (
            <SelectItem key={item.value} value={item.value} className="px-2 hover:px-3 hover:cursor-pointer hover:bg-antique-white-100 rounded-none hover:shadow-md hover:scale-105 hover:text-black">
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
      </PopoverContent>
  )
}
