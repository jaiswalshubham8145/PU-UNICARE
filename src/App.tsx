import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { I18nProvider } from "@/hooks/useI18n";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import BackgroundVideo from "./components/layout/BackgroundVideo";
import ChatWidget from "./components/chat/ChatWidget";
import AppRoutes from "./AppRoutes";
import SkipLink from "./components/SkipLink";
import { SiteTourProvider } from "./components/tour/SiteTourContext";
import SiteTourModal from "./components/tour/SiteTourModal";
import CommandPalette from "./components/common/CommandPalette";
import PWAInstallBanner from "./components/pwa/PWAInstallBanner";
import OfflineIndicator from "./components/pwa/OfflineIndicator";

// Manage Service Worker for PWA
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  } else {
    // In development, unregister any active service worker to prevent stale cache conflicts
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <I18nProvider>
            <AuthProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <SiteTourProvider>
                    <SkipLink />
                    <ScrollToTop />
                    <BackgroundVideo />
                    <OfflineIndicator />
                    <ChatWidget />
                    <SiteTourModal />
                    <CommandPalette />
                    <PWAInstallBanner />
                    <AppRoutes />
                  </SiteTourProvider>
                </BrowserRouter>
              </TooltipProvider>
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
