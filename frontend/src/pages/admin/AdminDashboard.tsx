import { useEffect, useMemo, useState } from "react";
import { Alert } from "../../components/ui/Alert";
import { Badge } from "../../components/ui/Badge";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../lib/api";
import { listUsers, updateUserRole, updateUserStatus } from "../../services/admin.service";
import { AuthUser, Role } from "../../types/auth";
import { ROLE_LABELS, ROLE_VARIANTS } from "../../utils/role";

type RoleFilter = "ALL" | Role;

const ROLE_FILTER_OPTIONS: { value: RoleFilter; label: string }[] = [
  { value: "ALL", label: "Todos los roles" },
  { value: "STUDENT", label: "Estudiantes" },
  { value: "TEACHER", label: "Docentes" },
  { value: "ADMIN", label: "Administradores" },
];

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" });

const AdminDashboard = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<AuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("ALL");

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await listUsers();
        setUsers(data);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      if (roleFilter !== "ALL" && user.role !== roleFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return (
        user.fullName.toLowerCase().includes(normalizedSearch) ||
        user.email.toLowerCase().includes(normalizedSearch) ||
        user.documentId.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [users, searchTerm, roleFilter]);

  const handleToggleRole = async (targetUser: AuthUser) => {
    const nextRole: Role = targetUser.role === "STUDENT" ? "TEACHER" : "STUDENT";
    setUpdatingId(targetUser.id);
    setError(null);

    try {
      const updated = await updateUserRole(targetUser.id, nextRole);
      setUsers((previous) => previous.map((user) => (user.id === updated.id ? updated : user)));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleStatus = async (targetUser: AuthUser) => {
    setUpdatingId(targetUser.id);
    setError(null);

    try {
      const updated = await updateUserStatus(targetUser.id, !targetUser.active);
      setUsers((previous) => previous.map((user) => (user.id === updated.id ? updated : user)));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Gestion de usuarios</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Busca usuarios, asigna el rol de docente y activa o desactiva cuentas.
        </p>
      </div>

      {error && <Alert message={error} />}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Buscar por nombre, correo o documento"
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-emerald-500"
        />
        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-emerald-500"
        >
          {ROLE_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className="text-sm text-neutral-500">Cargando...</p>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
          No se encontraron usuarios con estos filtros.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
          <table className="min-w-full divide-y divide-neutral-200 text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Nombre</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Correo</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Documento</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Rol</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Estado</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Registrado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredUsers.map((user) => {
                const isSelf = user.id === currentUser?.id;
                const isUpdating = updatingId === user.id;

                return (
                  <tr key={user.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-medium text-neutral-900">{user.fullName}</td>
                    <td className="px-4 py-3 text-neutral-500">{user.email}</td>
                    <td className="px-4 py-3 text-neutral-500">{user.documentId}</td>
                    <td className="px-4 py-3">
                      <Badge label={ROLE_LABELS[user.role]} variant={ROLE_VARIANTS[user.role]} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        label={user.active ? "Activo" : "Inactivo"}
                        variant={user.active ? "green" : "red"}
                      />
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        {user.role !== "ADMIN" && (
                          <button
                            type="button"
                            onClick={() => handleToggleRole(user)}
                            disabled={isSelf || isUpdating}
                            title={isSelf ? "No puedes modificar tu propio rol" : undefined}
                            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {user.role === "STUDENT" ? "Promover a docente" : "Volver a estudiante"}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user)}
                          disabled={isSelf || isUpdating}
                          title={isSelf ? "No puedes desactivar tu propia cuenta" : undefined}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                            user.active
                              ? "border-red-200 text-red-600 hover:bg-red-50"
                              : "border-green-200 text-green-700 hover:bg-green-50"
                          }`}
                        >
                          {user.active ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
