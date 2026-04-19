"use client";

import { Funnel } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { Popover, PopoverTrigger } from "./ui/popover";
import { DashboardFilterPopoverContent } from "./DashboardFilterPopover";
import { useDashboardSort } from "./DashboardSortContext";

export function DashboardFunnelButton() {
  const pathname = usePathname();
  const { selectedSort, setSelectedSort } = useDashboardSort();

  if (pathname !== "/") return null;

  return (
    <Popover>
      <PopoverTrigger>
        <Button
          type="button"
          aria-label="Filter batches"
          className="navbar-buttons rounded-full flex items-center bg-transparent justify-center p-1 text-antique-white-100"
        >
      <Funnel className="size-8" strokeWidth={2} />
    </Button>
    </PopoverTrigger>
    <DashboardFilterPopoverContent
      selectedSort={selectedSort}
      setSelectedSort={setSelectedSort}
    />
    </Popover>
  );
}
