import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../lib/api";
import { changePassword } from "../../services/profile.service";

const SetNewPassword = () => {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (newPassword !== confirmNewPassword) {
      setError("Las contrasenas nuevas no coinciden");
      return;
    }

    setIsSubmitting(true);

    try {
      await changePassword({ currentPassword, newPassword });
      await refreshUser();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="relative w-full max-w-md animate-slideUp space-y-6 rounded-2xl border border-neutral-200 bg-white/85 p-8 shadow-xl backdrop-blur-md">
        <div className="space-y-3 text-center">
          <img src="/fet-logo-full.png" alt="Logo FET" className="mx-auto h-20 w-auto" />
          <h1 className="text-2xl font-semibold text-neutral-900">Configura tu contrasena</h1>
          <p className="text-sm text-neutral-500">
            Hola {user?.fullName}. Por seguridad, debes reemplazar la contrasena temporal que te
            asigno el administrador antes de continuar.
          </p>
        </div>

        {error && <Alert message={error} />}

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <Input
            label="Contrasena temporal actual"
            type="password"
            name="currentPassword"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
          />
          <Input
            label="Nueva contrasena"
            type="password"
            name="newPassword"
            autoComplete="new-password"
            minLength={8}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
          />
          <Input
            label="Confirmar nueva contrasena"
            type="password"
            name="confirmNewPassword"
            autoComplete="new-password"
            minLength={8}
            value={confirmNewPassword}
            onChange={(event) => setConfirmNewPassword(event.target.value)}
            required
          />
          <Button type="submit" isLoading={isSubmitting}>
            Guardar y continuar
          </Button>
        </form>

        <button
          type="button"
          onClick={() => logout()}
          className="w-full text-center text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-700"
        >
          Cerrar sesion
        </button>
      </div>
    </div>
  );
};

export default SetNewPassword;
