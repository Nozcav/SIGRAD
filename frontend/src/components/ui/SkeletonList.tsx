import { Skeleton } from "./Skeleton";

interface SkeletonListProps {
  rows?: number;
}

// Imita filas de tabla o listas de tarjetas mientras cargan los datos.
export const SkeletonList = ({ rows = 4 }: SkeletonListProps) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, index) => (
      <div
        key={index}
        className="flex items-center gap-4 rounded-2xl border border-white/60 bg-white/70 p-5 backdrop-blur-xl"
      >
        <Skeleton className="h-10 w-10 flex-shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-6 w-20 flex-shrink-0 rounded-full" />
      </div>
    ))}
  </div>
);
