import { FormEvent, useEffect, useState } from "react";
import { Alert } from "../components/ui/Alert";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getApiErrorMessage } from "../lib/api";
import { changePassword, updateProfile } from "../services/profile.service";
import { celebrate } from "../utils/celebrate";
import { ROLE_LABELS, ROLE_VARIANTS } from "../utils/role";

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" });

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [documentId, setDocumentId] = useState(user?.documentId ?? "");
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setDocumentId(user.documentId);
    }
  }, [user]);

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileError(null);
    setIsSavingProfile(true);

    try {
      await updateProfile({ fullName, documentId });
      await refreshUser();
      celebrate();
      showToast("Tu informacion personal se actualizo correctamente", "success");
    } catch (err) {
      setProfileError(getApiErrorMessage(err));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError(null);

    if (newPassword !== confirmNewPassword) {
      setPasswordError("Las contrasenas nuevas no coinciden");
      return;
    }

    setIsSavingPassword(true);

    try {
      await changePassword({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      celebrate();
      showToast("Tu contrasena se actualizo correctamente", "success");
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
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-6 animate-slideUp">
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

      <div className="animate-slideUp space-y-5 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-6">
        <h2 className="text-lg font-semibold text-neutral-900">Informacion personal</h2>

        {profileError && <Alert message={profileError} />}

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

      <div className="animate-slideUp space-y-5 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-6">
        <h2 className="text-lg font-semibold text-neutral-900">Cambiar contrasena</h2>

        {passwordError && <Alert message={passwordError} />}

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
