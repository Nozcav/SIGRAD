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
      className="rounded-md border border-neutral-300 px-2 py-1 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-100"
    >
      {copied ? "Copiado" : "Copiar"}
    </button>
  );
};
