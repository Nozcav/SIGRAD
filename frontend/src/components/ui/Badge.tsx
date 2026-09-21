type BadgeVariant = "neutral" | "green" | "amber" | "red" | "brand";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  pulse?: boolean;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  neutral: "bg-neutral-100 text-neutral-700",
  green: "bg-green-100 text-green-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
  brand: "bg-brand-100 text-brand-700",
};

const DOT_CLASSES: Record<BadgeVariant, string> = {
  neutral: "bg-neutral-500",
  green: "bg-green-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  brand: "bg-brand-500",
};

export const Badge = ({ label, variant = "neutral", pulse = false }: BadgeProps) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${VARIANT_CLASSES[variant]}`}
    >
      {pulse && (
        <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${DOT_CLASSES[variant]}`} />
      )}
      {label}
    </span>
  );
};
