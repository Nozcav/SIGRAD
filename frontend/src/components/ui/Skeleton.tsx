interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = "" }: SkeletonProps) => (
  <div
    className={`animate-shimmer rounded-lg bg-gradient-to-r from-neutral-200/70 via-white/90 to-neutral-200/70 bg-[length:200%_100%] ${className}`}
  />
);
