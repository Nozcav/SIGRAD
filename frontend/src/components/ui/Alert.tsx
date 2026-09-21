type AlertVariant = "error" | "success";

interface AlertProps {
  message: string;
  variant?: AlertVariant;
}

const VARIANT_CLASSES: Record<AlertVariant, string> = {
  error: "border-red-200 bg-red-50 text-red-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export const Alert = ({ message, variant = "error" }: AlertProps) => {
  return (
    <div
      className={`animate-fadeIn rounded-lg border px-4 py-3 text-sm ${VARIANT_CLASSES[variant]}`}
    >
      {message}
    </div>
  );
};
