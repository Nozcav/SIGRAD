import { useState } from "react";

interface CopyButtonProps {
  value: string;
}

export const CopyButton = ({ value }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`rounded-md border px-2 py-1 text-xs font-semibold transition-all duration-300 hover:scale-105 active:scale-95 ${
        copied
          ? "border-emerald-500 bg-emerald-500 text-white"
          : "border-neutral-300 text-neutral-600 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
      }`}
    >
      {copied ? "Copiado ✓" : "Copiar"}
    </button>
  );
};
