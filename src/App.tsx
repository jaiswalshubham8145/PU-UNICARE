import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ScrollToTop from "./components/ScrollToTop";
import { ErrorBoundary } from "./lib/errorMonitor";
import BackgroundVideo from "./components/layout/BackgroundVideo";
import ChatWidget from "./components/chat/ChatWidget";
import AppRoutes from "./AppRoutes";
import SkipLink from "./components/SkipLink";

// Performance: Initialize preconnects for external resources
if (typeof window !== 'undefined') {
  const preconnectUrls = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ];

  preconnectUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            {/* Accessibility: Skip link for keyboard users */}
            <SkipLink />
            <ScrollToTop />
            <BackgroundVideo />
            <ChatWidget />
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

