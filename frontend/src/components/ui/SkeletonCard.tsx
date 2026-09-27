import { Skeleton } from "./Skeleton";

// Imita la forma de una SummaryCard mientras cargan los datos reales.
export const SkeletonCard = () => (
  <div className="overflow-hidden rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl">
    <Skeleton className="h-1.5 w-full rounded-none" />
    <div className="flex items-start justify-between gap-3 p-6">
      <div className="space-y-3">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-9 w-14" />
      </div>
      <Skeleton className="h-11 w-11 rounded-xl" />
    </div>
  </div>
);
