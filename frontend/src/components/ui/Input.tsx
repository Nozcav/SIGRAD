import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, name, className = "", ...props }, ref) => {
    const inputId = id ?? name;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm font-medium text-neutral-700">
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          name={name}
          className={`rounded-lg border-2 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition-all duration-200 focus:scale-[1.01] focus:border-transparent focus:ring-4 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-500 ${
            error
              ? "border-red-400 focus:ring-red-400/40"
              : "border-neutral-200 hover:border-neutral-300 focus:ring-emerald-500/30"
          } ${className}`}
          {...props}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
