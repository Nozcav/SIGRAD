import { FormEvent, useEffect, useState } from "react";
import { Alert } from "../components/ui/Alert";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../lib/api";
import { changePassword, updateProfile } from "../services/profile.service";
import { ROLE_LABELS, ROLE_VARIANTS } from "../utils/role";

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" });

const SUCCESS_MESSAGE_TIMEOUT_MS = 3000;

const Profile = () => {
  const { user, refreshUser } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [documentId, setDocumentId] = useState(user?.documentId ?? "");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setDocumentId(user.documentId);
    }
  }, [user]);

  useEffect(() => {
    if (!profileSuccess) {
      return;
    }
    const timeout = setTimeout(() => setProfileSuccess(null), SUCCESS_MESSAGE_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [profileSuccess]);

  useEffect(() => {
    if (!passwordSuccess) {
      return;
    }
    const timeout = setTimeout(() => setPasswordSuccess(null), SUCCESS_MESSAGE_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [passwordSuccess]);

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);
    setIsSavingProfile(true);

    try {
      await updateProfile({ fullName, documentId });
      await refreshUser();
      setProfileSuccess("Tu informacion personal se actualizo correctamente.");
    } catch (err) {
      setProfileError(getApiErrorMessage(err));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword !== confirmNewPassword) {
      setPasswordError("Las contrasenas nuevas no coinciden");
      return;
    }

    setIsSavingPassword(true);

    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordSuccess("Tu contrasena se actualizo correctamente.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setPasswordError(getApiErrorMessage(err));
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Mi perfil</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Consulta y edita tu informacion personal, o cambia tu contrasena.
        </p>
      </div>

      {user && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-6 animate-slideUp">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">
            {user.fullName
              .trim()
              .split(/\s+/)
              .slice(0, 2)
              .map((part) => part[0]?.toUpperCase())
              .join("")}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-neutral-900">{user.fullName}</p>
              <Badge label={ROLE_LABELS[user.role]} variant={ROLE_VARIANTS[user.role]} />
            </div>
            <p className="text-sm text-neutral-500">{user.email}</p>
            <p className="text-xs text-neutral-400">Miembro desde {formatDate(user.createdAt)}</p>
          </div>
        </div>
      )}

      <div className="animate-slideUp space-y-5 rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-neutral-900">Informacion personal</h2>

        {profileError && <Alert message={profileError} />}
        {profileSuccess && <Alert message={profileSuccess} variant="success" />}

        <form className="space-y-5" onSubmit={handleProfileSubmit} noValidate>
          <Input
            label="Nombre completo"
            name="fullName"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />
          <Input
            label="Documento de identidad"
            name="documentId"
            value={documentId}
            onChange={(event) => setDocumentId(event.target.value)}
            required
          />
          <Input
            label="Correo institucional"
            name="email"
            value={user?.email ?? ""}
            disabled
            title="El correo institucional no se puede modificar"
          />
          <Button type="submit" isLoading={isSavingProfile} className="sm:w-auto sm:px-8">
            Guardar cambios
          </Button>
        </form>
      </div>

      <div className="animate-slideUp space-y-5 rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-neutral-900">Cambiar contrasena</h2>

        {passwordError && <Alert message={passwordError} />}
        {passwordSuccess && <Alert message={passwordSuccess} variant="success" />}

        <form className="space-y-5" onSubmit={handlePasswordSubmit} noValidate>
          <Input
            label="Contrasena actual"
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
          <Button type="submit" isLoading={isSavingPassword} className="sm:w-auto sm:px-8">
            Actualizar contrasena
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
