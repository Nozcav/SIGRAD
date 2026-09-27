import { ComponentType, ReactNode, SVGProps } from "react";

interface EmptyStateProps {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  message: string;
  action?: ReactNode;
}

export const EmptyState = ({ icon: Icon, message, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-neutral-300 bg-white/60 p-10 text-center backdrop-blur-md">
    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
      <Icon className="h-7 w-7" />
    </span>
    <p className="text-sm text-neutral-500">{message}</p>
    {action}
  </div>
);
