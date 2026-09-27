import { Skeleton } from "./Skeleton";

interface SkeletonBlockProps {
  lines?: number;
}

// Imita una tarjeta de contenido (titulo + parrafos) en pantallas de detalle.
export const SkeletonBlock = ({ lines = 3 }: SkeletonBlockProps) => (
  <div className="space-y-4 rounded-2xl border border-white/60 bg-white/70 p-6 backdrop-blur-xl">
    <Skeleton className="h-5 w-40" />
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton key={index} className={`h-4 ${index === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  </div>
);
