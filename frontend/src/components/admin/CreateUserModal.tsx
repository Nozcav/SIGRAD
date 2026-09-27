import { FormEvent, useState } from "react";
import { useToast } from "../../context/ToastContext";
import { getApiErrorMessage } from "../../lib/api";
import { createUser } from "../../services/admin.service";
import { AuthUser, CreateUserResult, Role } from "../../types/auth";
import { celebrate } from "../../utils/celebrate";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Modal } from "../ui/Modal";

interface CreateUserModalProps {
  onClose: () => void;
  onCreated: (user: AuthUser) => void;
}

type PasswordMode = "auto" | "manual";

const ROLE_OPTIONS: { value: Extract<Role, "STUDENT" | "TEACHER">; label: string }[] = [
  { value: "STUDENT", label: "Estudiante" },
  { value: "TEACHER", label: "Docente" },
];

const PASSWORD_MODE_OPTIONS: { value: PasswordMode; label: string }[] = [
  { value: "auto", label: "Generar automaticamente" },
  { value: "manual", label: "Escribir contrasena" },
];

export const CreateUserModal = ({ onClose, onCreated }: CreateUserModalProps) => {
  const { showToast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [role, setRole] = useState<Extract<Role, "STUDENT" | "TEACHER">>("STUDENT");

  const [passwordMode, setPasswordMode] = useState<PasswordMode>("auto");
  const [manualPassword, setManualPassword] = useState("");
  const [confirmManualPassword, setConfirmManualPassword] = useState("");
  const [passwordFieldError, setPasswordFieldError] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [created, setCreated] = useState<CreateUserResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handlePasswordModeChange = (mode: PasswordMode) => {
    setPasswordMode(mode);
    setPasswordFieldError(null);
    setManualPassword("");
    setConfirmManualPassword("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setPasswordFieldError(null);

    if (passwordMode === "manual") {
      if (manualPassword.length < 8) {
        setPasswordFieldError("La contrasena debe tener al menos 8 caracteres");
        return;
      }
      if (manualPassword !== confirmManualPassword) {
        setPasswordFieldError("Las contrasenas no coinciden");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const result = await createUser({
        fullName,
        email,
        documentId,
        role,
        password: passwordMode === "manual" ? manualPassword : undefined,
      });
      setCreated(result);
      onCreated(result.user);
      celebrate();
      showToast(`Usuario ${result.user.fullName} creado correctamente`, "success");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!created) {
      return;
    }

    const credentialsText = [
      `Usuario: ${created.user.email}`,
      `Contrasena: ${created.temporaryPassword}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(credentialsText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (created) {
    return (
      <Modal title="Usuario creado" onClose={onClose}>
        <div className="space-y-4">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
            Guarda esta contrasena ahora: no se volvera a mostrar. Compartela con{" "}
            <span className="font-medium">{created.user.fullName}</span> por un medio seguro.
          </div>

          <div className="space-y-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Correo
              </p>
              <p className="font-mono text-sm text-neutral-900">{created.user.email}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                Contrasena {passwordMode === "manual" ? "" : "temporal"}
              </p>
              <p className="font-mono text-lg font-semibold tracking-wide text-neutral-900">
                {created.temporaryPassword}
              </p>
            </div>
          </div>

          <Button type="button" onClick={handleCopy}>
            {copied ? "Copiado" : "Copiar credenciales"}
          </Button>

          <button
            type="button"
            onClick={onClose}
            className="w-full text-center text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-700"
          >
            Cerrar
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title="Crear usuario" onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {error && <Alert message={error} />}

        <Input
          label="Nombre completo"
          name="fullName"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          required
        />
        <Input
          label="Correo institucional"
          type="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Input
          label="Documento de identidad"
          name="documentId"
          value={documentId}
          onChange={(event) => setDocumentId(event.target.value)}
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700">Rol</label>
          <div className="flex gap-2">
            {ROLE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setRole(option.value)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  role === option.value
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700">Contrasena inicial</label>
          <div className="flex gap-2">
            {PASSWORD_MODE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handlePasswordModeChange(option.value)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  passwordMode === option.value
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {passwordMode === "manual" && (
          <div className="space-y-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <Input
              label="Contrasena"
              type="password"
              name="manualPassword"
              autoComplete="new-password"
              minLength={8}
              value={manualPassword}
              onChange={(event) => setManualPassword(event.target.value)}
              error={passwordFieldError ?? undefined}
              required
            />
            <Input
              label="Confirmar contrasena"
              type="password"
              name="confirmManualPassword"
              autoComplete="new-password"
              minLength={8}
              value={confirmManualPassword}
              onChange={(event) => setConfirmManualPassword(event.target.value)}
              required
            />
          </div>
        )}

        <p className="text-xs text-neutral-500">
          {passwordMode === "auto"
            ? "El sistema genera una contrasena temporal segura y aleatoria."
            : "Definiste la contrasena inicial del usuario."}{" "}
          En cualquier caso, debera reemplazarla en su primer inicio de sesion.
        </p>

        <Button type="submit" isLoading={isSubmitting}>
          Crear usuario
        </Button>
      </form>
    </Modal>
  );
};
