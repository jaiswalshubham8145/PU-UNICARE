import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-white/[0.08] dark:bg-white/[0.06] backdrop-blur-sm before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.12] before:to-transparent",
        className
      )}
      {...props}
    />
  );
}

// 4-column KPI stats grid skeleton
export function DashboardStatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3 relative overflow-hidden shadow-lg">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-9 rounded-xl" />
          </div>
          <Skeleton className="h-9 w-28" />
          <div className="flex items-center gap-2 pt-1 border-t border-white/5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Table rows skeleton with avatar, status badge, priority, date & action button
export function TableRowsSkeleton({ rows = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="w-full space-y-3">
      {/* Table Header skeleton */}
      <div className="flex items-center gap-4 px-4 py-3 bg-white/5 rounded-xl border border-white/10">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-44 hidden md:block" />
        <Skeleton className="h-4 w-28 hidden lg:block" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20 hidden sm:block" />
        <div className="ml-auto">
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="hidden md:block flex-1 space-y-1.5 max-w-sm">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-6 w-24 rounded-full hidden lg:block" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-20 hidden sm:block" />
          <div className="ml-auto flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-20 rounded-lg hidden sm:block" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Mobile-responsive Complaint Cards skeleton
export function ComplaintCardListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-panel p-5 rounded-2xl border border-white/10 space-y-4 shadow-lg">
          <div className="flex justify-between items-start gap-3">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-24 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-5 w-3/4" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <Skeleton className="h-10 w-full rounded-lg" />
          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-7 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Full page skeleton for AppRoutes Suspense fallback
export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Navbar skeleton */}
      <div className="h-20 border-b border-white/10 px-6 flex items-center justify-between bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>

      {/* Main body skeleton */}
      <div className="container mx-auto px-4 sm:px-6 py-8 flex-1 space-y-8 max-w-7xl animate-fade-in">
        {/* Breadcrumb / Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 sm:h-10 w-64 rounded-xl" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>

        {/* 4 KPI cards */}
        <DashboardStatsSkeleton count={4} />

        {/* Table / Content area */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
            <Skeleton className="h-6 w-44" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-64 max-w-full rounded-xl" />
              <Skeleton className="h-9 w-24 rounded-xl" />
            </div>
          </div>
          <TableRowsSkeleton rows={5} />
        </div>
      </div>
    </div>
  );
}

export { Skeleton };
