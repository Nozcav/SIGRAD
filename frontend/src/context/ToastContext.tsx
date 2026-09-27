import {
  ComponentType,
  ReactNode,
  SVGProps,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { AlertCircleIcon, CheckCircleIcon, SparklesIcon, XIcon } from "../components/icons/Icons";

type ToastVariant = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const TOAST_DURATION_MS = 4500;
let toastIdCounter = 0;

const VARIANT_STYLES: Record<
  ToastVariant,
  { icon: ComponentType<SVGProps<SVGSVGElement>>; ring: string; iconBg: string; iconColor: string; bar: string }
> = {
  success: {
    icon: CheckCircleIcon,
    ring: "ring-emerald-300/60",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    bar: "bg-emerald-500",
  },
  error: {
    icon: AlertCircleIcon,
    ring: "ring-red-300/60",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    bar: "bg-red-500",
  },
  info: {
    icon: SparklesIcon,
    ring: "ring-brand-300/60",
    iconBg: "bg-brand-100",
    iconColor: "text-brand-700",
    bar: "bg-brand-500",
  },
};

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: () => void;
}

const ToastCard = ({ toast, onDismiss }: ToastCardProps) => {
  const style = VARIANT_STYLES[toast.variant];
  const Icon = style.icon;

  return (
    <div
      className={`pointer-events-auto w-full animate-toastIn overflow-hidden rounded-2xl border border-white/60 bg-white/90 shadow-2xl shadow-brand-900/10 backdrop-blur-xl ring-1 ${style.ring}`}
    >
      <div className="flex items-start gap-3 p-4">
        <span
          className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${style.iconBg}`}
        >
          <Icon className={`h-5 w-5 ${style.iconColor}`} />
        </span>
        <p className="flex-1 pt-1.5 text-sm font-medium text-neutral-800">{toast.message}</p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Cerrar notificacion"
          className="rounded-lg p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </div>
      <div className="h-1 w-full bg-neutral-100">
        <div
          className={`h-full animate-toastProgress ${style.bar}`}
          style={{ animationDuration: `${TOAST_DURATION_MS}ms` }}
        />
      </div>
    </div>
  );
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = toastIdCounter++;
      setToasts((previous) => [...previous, { id, message, variant }]);
      window.setTimeout(() => dismissToast(id), TOAST_DURATION_MS);
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-20 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3 sm:right-6">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={() => dismissToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast debe usarse dentro de un ToastProvider");
  }

  return context;
};
