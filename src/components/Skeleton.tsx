import {
  Skeleton,
  DashboardStatsSkeleton,
  TableRowsSkeleton,
  ComplaintCardListSkeleton,
  PageLoadingSkeleton,
} from '@/components/ui/skeleton';

export {
  Skeleton,
  DashboardStatsSkeleton,
  TableRowsSkeleton,
  ComplaintCardListSkeleton,
  PageLoadingSkeleton,
};

export function PageSkeleton() {
  return <PageLoadingSkeleton />;
}

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <DashboardStatsSkeleton count={4} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-96 lg:col-span-2 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number; cols?: number }) {
  return <TableRowsSkeleton rows={rows} />;
}

export function CardSkeleton() {
  return (
    <div className="glass-panel p-6 rounded-2xl space-y-4 border border-white/10">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-20" />
    </div>
  );
}
