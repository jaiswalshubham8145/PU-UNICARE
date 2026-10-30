import { useState, useCallback, useEffect } from "react";
import { fireCelebrationConfetti } from "@/utils/confetti";

const TOUR_STORAGE_KEY = "pu_unicare_tour_completed";
const TOUR_DISMISSED_KEY = "pu_unicare_tour_dismissed";

export interface UseSiteTourReturn {
  /** Whether the tour modal is currently open */
  isTourOpen: boolean;
  /** Open the tour modal */
  openTour: () => void;
  /** Close the tour modal */
  closeTour: () => void;
  /** Current step index (0-based) */
  currentStep: number;
  /** Navigate to a specific step */
  goToStep: (step: number) => void;
  /** Move to the next step */
  nextStep: () => void;
  /** Move to the previous step */
  prevStep: () => void;
  /** Total number of steps */
  totalSteps: number;
  /** Whether the user has completed the tour before */
  hasCompletedTour: boolean;
  /** Mark tour as completed */
  completeTour: () => void;
  /** Reset tour (clear localStorage) so it can be replayed */
  resetTour: () => void;
  /** Whether the welcome banner should be visible */
  showWelcomeBanner: boolean;
  /** Dismiss the welcome banner */
  dismissBanner: () => void;
  /** Active view mode: 'walkthrough' or 'directory' */
  viewMode: "walkthrough" | "directory";
  /** Set the active view mode */
  setViewMode: (mode: "walkthrough" | "directory") => void;
}

export function useSiteTour(totalSteps: number = 10): UseSiteTourReturn {
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [viewMode, setViewMode] = useState<"walkthrough" | "directory">("walkthrough");

  const [hasCompletedTour, setHasCompletedTour] = useState(() => {
    try {
      return localStorage.getItem(TOUR_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  const [bannerDismissed, setBannerDismissed] = useState(() => {
    try {
      return localStorage.getItem(TOUR_DISMISSED_KEY) === "true";
    } catch {
      return false;
    }
  });

  // Show the welcome banner only for first-time visitors who haven't dismissed it
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);

  useEffect(() => {
    if (!hasCompletedTour && !bannerDismissed) {
      // Delay showing the banner by 2 seconds for a smooth entry
      const timer = setTimeout(() => {
        setShowWelcomeBanner(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedTour, bannerDismissed]);

  const openTour = useCallback(() => {
    setCurrentStep(0);
    setViewMode("walkthrough");
    setIsTourOpen(true);
    setShowWelcomeBanner(false);
  }, []);

  const closeTour = useCallback(() => {
    setIsTourOpen(false);
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      if (step >= 0 && step < totalSteps) {
        setCurrentStep(step);
      }
    },
    [totalSteps]
  );

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Last step — complete the tour with celebration!
      setHasCompletedTour(true);
      try {
        localStorage.setItem(TOUR_STORAGE_KEY, "true");
      } catch { /* noop */ }
      setIsTourOpen(false);
      fireCelebrationConfetti();
    }
  }, [currentStep, totalSteps]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const completeTour = useCallback(() => {
    setHasCompletedTour(true);
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, "true");
    } catch { /* noop */ }
    setIsTourOpen(false);
    fireCelebrationConfetti();
  }, []);

  const resetTour = useCallback(() => {
    setHasCompletedTour(false);
    setBannerDismissed(false);
    try {
      localStorage.removeItem(TOUR_STORAGE_KEY);
      localStorage.removeItem(TOUR_DISMISSED_KEY);
    } catch { /* noop */ }
  }, []);

  const dismissBanner = useCallback(() => {
    setShowWelcomeBanner(false);
    setBannerDismissed(true);
    try {
      localStorage.setItem(TOUR_DISMISSED_KEY, "true");
    } catch { /* noop */ }
  }, []);

  return {
    isTourOpen,
    openTour,
    closeTour,
    currentStep,
    goToStep,
    nextStep,
    prevStep,
    totalSteps,
    hasCompletedTour,
    completeTour,
    resetTour,
    showWelcomeBanner,
    dismissBanner,
    viewMode,
    setViewMode,
  };
}
