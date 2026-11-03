import { useState } from "react";
import { resetUserPassword } from "../../services/admin.service";
import { AuthUser } from "../../types/auth";
import { getApiErrorMessage } from "../../lib/api";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

interface ResetPasswordModalProps {
  user: AuthUser;
  onClose: () => void;
}

export const ResetPasswordModal = ({ user, onClose }: ResetPasswordModalProps) => {
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleReset = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await resetUserPassword(user.id);
      setTemporaryPassword(result.temporaryPassword);
    } catch (resetError) {
      setError(getApiErrorMessage(resetError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!temporaryPassword) return;
    setCopyError(null);
    try {
      await navigator.clipboard.writeText(temporaryPassword);
      setCopied(true);
    } catch {
      setCopyError("No se pudo copiar la contraseña. Puedes seleccionarla y copiarla manualmente.");
    }
  };

  return (
    <Modal title="Restablecer contraseña" onClose={onClose}>
      <div className="space-y-4">
        {error && <Alert message={error} />}

        {temporaryPassword ? (
          <>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              Comparte esta contraseña temporal con {user.fullName} por un medio seguro. Solo se
              mostrará esta vez y deberá cambiarla al iniciar sesión.
            </div>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Contraseña temporal
              </p>
              <p className="mt-2 break-all font-mono text-lg font-semibold tracking-wide text-neutral-900">
                {temporaryPassword}
              </p>
            </div>
            {copyError && <Alert message={copyError} />}
            <Button type="button" onClick={handleCopy}>
              {copied ? "Copiada" : "Copiar contraseña"}
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="w-full text-center text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-700"
            >
              Cerrar
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-neutral-600">
              Se generará una contraseña temporal para <strong>{user.fullName}</strong>. Su
              contraseña actual dejará de funcionar y deberá establecer una nueva al iniciar
              sesión.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="button" disabled={isSubmitting} onClick={() => void handleReset()}>
                {isSubmitting ? "Restableciendo…" : "Confirmar restablecimiento"}
              </Button>
              <Button
                type="button"
                disabled={isSubmitting}
                className="bg-neutral-100 text-neutral-700 shadow-none ring-0 hover:bg-neutral-200 hover:shadow-none"
                onClick={onClose}
              >
                Cancelar
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
