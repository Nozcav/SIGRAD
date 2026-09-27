type BadgeVariant = "neutral" | "green" | "amber" | "red" | "brand";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  pulse?: boolean;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  neutral: "bg-neutral-600 text-white shadow-sm shadow-neutral-600/20",
  green: "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30",
  amber: "bg-amber-500 text-white shadow-sm shadow-amber-500/30",
  red: "bg-red-500 text-white shadow-sm shadow-red-500/30",
  brand: "bg-gradient-to-r from-brand-600 to-emerald-500 text-white shadow-sm shadow-brand-600/30",
};

const DOT_CLASSES: Record<BadgeVariant, string> = {
  neutral: "bg-white",
  green: "bg-white",
  amber: "bg-white",
  red: "bg-white",
  brand: "bg-white",
};

export const Badge = ({ label, variant = "neutral", pulse = false }: BadgeProps) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-transform duration-200 hover:scale-105 ${VARIANT_CLASSES[variant]}`}
    >
      {pulse && (
        <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${DOT_CLASSES[variant]}`} />
      )}
      {label}
    </span>
  );
};
