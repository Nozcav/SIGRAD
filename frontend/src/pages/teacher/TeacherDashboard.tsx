import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Alert } from "../../components/ui/Alert";
import { Badge } from "../../components/ui/Badge";
import { CopyButton } from "../../components/ui/CopyButton";
import { getApiErrorMessage } from "../../lib/api";
import { archiveForm, listMyForms, updateFormStatus } from "../../services/forms.service";
import { FormListItem, FormStatus } from "../../types/form";
import { FORM_STATUS_LABELS, FORM_STATUS_VARIANTS } from "../../utils/formStatus";

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" });

interface SummaryCardProps {
  label: string;
  value: number;
}

const SummaryCard = ({ label, value }: SummaryCardProps) => (
  <div className="rounded-2xl border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-md">
    <p className="text-sm font-medium text-neutral-500">{label}</p>
    <p className="mt-2 text-3xl font-semibold text-neutral-900">{value}</p>
  </div>
);

const TeacherDashboard = () => {
  const [forms, setForms] = useState<FormListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await listMyForms();
        setForms(data);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleToggleStatus = async (form: FormListItem) => {
    const nextStatus: FormStatus = form.status === "ACTIVE" ? "CLOSED" : "ACTIVE";
    setUpdatingId(form.id);
    setError(null);

    try {
      await updateFormStatus(form.id, nextStatus);
      setForms((previous) =>
        previous.map((item) => (item.id === form.id ? { ...item, status: nextStatus } : item))
      );
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleArchive = async (form: FormListItem) => {
    const confirmed = window.confirm(
      `Vas a archivar "${form.title}". Los estudiantes ya no podran acceder con el codigo ${form.code}. Deseas continuar?`
    );

    if (!confirmed) {
      return;
    }

    setUpdatingId(form.id);
    setError(null);

    try {
      await archiveForm(form.id);
      setForms((previous) =>
        previous.map((item) => (item.id === form.id ? { ...item, status: "ARCHIVED" } : item))
      );
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  const totalForms = forms.length;
  const activeForms = forms.filter((form) => form.status === "ACTIVE").length;
  const totalResponses = forms.reduce((total, form) => total + form.responseCount, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Mis formularios</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Crea, comparte y revisa las respuestas de tus formularios.
          </p>
        </div>
        <Link
          to="/teacher/forms/new"
          className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          + Nuevo formulario
        </Link>
      </div>

      {error && <Alert message={error} />}

      {isLoading ? (
        <p className="text-sm text-neutral-500">Cargando...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard label="Formularios creados" value={totalForms} />
            <SummaryCard label="Formularios activos" value={activeForms} />
            <SummaryCard label="Respuestas recibidas" value={totalResponses} />
          </div>

          {forms.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
              Aun no has creado ningun formulario.
            </div>
          ) : (
            <div className="space-y-4">
              {forms.map((form) => (
                <div
                  key={form.id}
                  className="rounded-2xl border border-neutral-200 bg-white p-5 transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold text-neutral-900">{form.title}</h2>
                        <Badge
                          label={FORM_STATUS_LABELS[form.status]}
                          variant={FORM_STATUS_VARIANTS[form.status]}
                        />
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-sm text-neutral-500">
                        <span className="font-mono">{form.code}</span>
                        <CopyButton value={form.code} />
                      </div>
                      <p className="mt-2 text-sm text-neutral-500">
                        Creado el {formatDate(form.createdAt)} - {form.responseCount}{" "}
                        {form.responseCount === 1 ? "respuesta" : "respuestas"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        to={`/teacher/forms/${form.id}/responses`}
                        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
                      >
                        Ver respuestas
                      </Link>
                      <Link
                        to={`/teacher/forms/${form.id}/edit`}
                        className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
                      >
                        Editar
                      </Link>
                      {form.status !== "ARCHIVED" && (
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(form)}
                          disabled={updatingId === form.id}
                          className="rounded-lg border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {form.status === "ACTIVE" ? "Cerrar" : "Activar"}
                        </button>
                      )}
                      {form.status !== "ARCHIVED" && (
                        <button
                          type="button"
                          onClick={() => handleArchive(form)}
                          disabled={updatingId === form.id}
                          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Archivar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TeacherDashboard;
