import { ButtonHTMLAttributes, MouseEvent, useState } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

let rippleIdCounter = 0;

export const Button = ({
  isLoading = false,
  disabled,
  children,
  className = "",
  onClick,
  ...props
}: ButtonProps) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.8;
    const id = rippleIdCounter++;

    setRipples((previous) => [
      ...previous,
      {
        id,
        x: event.clientX - rect.left - size / 2,
        y: event.clientY - rect.top - size / 2,
        size,
      },
    ]);

    window.setTimeout(() => {
      setRipples((previous) => previous.filter((ripple) => ripple.id !== id));
    }, 650);

    onClick?.(event);
  };

  return (
    <button
      disabled={disabled || isLoading}
      onClick={handleClick}
      className={`relative inline-flex w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-r from-brand-600 via-emerald-500 to-brand-600 bg-200 bg-[position:0%_50%] bg-no-repeat px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_10px_1px_rgba(16,185,129,0.35)] ring-1 ring-inset ring-emerald-300/30 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:scale-[1.02] hover:bg-[position:100%_50%] hover:animate-neonPulse hover:ring-2 hover:ring-emerald-300/80 active:translate-y-0 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none disabled:ring-0 disabled:hover:translate-y-0 disabled:hover:scale-100 disabled:hover:animate-none ${className}`}
      style={{ backgroundSize: "200% auto", transition: "background-position 0.5s ease, transform 0.3s ease, box-shadow 0.3s ease" }}
      {...props}
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          aria-hidden="true"
          className="pointer-events-none absolute animate-ripple rounded-full bg-white/50"
          style={{ left: ripple.x, top: ripple.y, width: ripple.size, height: ripple.size }}
        />
      ))}
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          Cargando...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
