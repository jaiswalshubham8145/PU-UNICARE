import { createContext, useContext, type ReactNode } from "react";
import { useSiteTour, type UseSiteTourReturn } from "@/hooks/useSiteTour";
import { tourSteps } from "./tourData";

const SiteTourContext = createContext<UseSiteTourReturn | null>(null);

export function useTourContext() {
  const ctx = useContext(SiteTourContext);
  if (!ctx) {
    throw new Error("useTourContext must be used within SiteTourProvider");
  }
  return ctx;
}

export const useSiteTourContext = useTourContext;

export function SiteTourProvider({ children }: { children: ReactNode }) {
  const tour = useSiteTour(tourSteps.length);

  return (
    <SiteTourContext.Provider value={tour}>
      {children}
    </SiteTourContext.Provider>
  );
}
