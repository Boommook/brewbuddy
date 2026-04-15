"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

export type DashboardSort =
  | "mostUrgent"
  | "leastUrgent"
  | "nameAZ"
  | "nameZA"
  | "newest"
  | "oldest";

// type for the context value. needs a value and setter just like useState
type DashboardSortContextValue = {
  selectedSort: DashboardSort;
  setSelectedSort: (sort: DashboardSort) => void;
};

// create the context, initial value is null
const DashboardSortContext = createContext<DashboardSortContextValue | null>(
  null,
);

// provider component that wraps the app and provides the context value
export function DashboardSortProvider({ children }: { children: ReactNode }) {
  const [selectedSort, setSelectedSort] =
    useState<DashboardSort>("mostUrgent");

  return (
    <DashboardSortContext.Provider value={{ selectedSort, setSelectedSort }}>
      {children}
    </DashboardSortContext.Provider>
  );
}

// hook to use the context value
export function useDashboardSort(): DashboardSortContextValue {
  const ctx = useContext(DashboardSortContext);
  if (!ctx) {
    throw new Error(
      "useDashboardSort must be used within DashboardSortProvider",
    );
  }
  return ctx;
}
