import { ComponentType, SVGProps, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircleIcon, ChatIcon, DocumentIcon } from "../../components/icons/Icons";
import { AnimatedNumber } from "../../components/ui/AnimatedNumber";
import { Alert } from "../../components/ui/Alert";
import { Badge } from "../../components/ui/Badge";
import { CopyButton } from "../../components/ui/CopyButton";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonCard } from "../../components/ui/SkeletonCard";
import { SkeletonList } from "../../components/ui/SkeletonList";
import { getApiErrorMessage } from "../../lib/api";
import { archiveForm, listMyForms, updateFormStatus } from "../../services/forms.service";
import { FormListItem, FormStatus } from "../../types/form";
import { FORM_STATUS_LABELS, FORM_STATUS_VARIANTS } from "../../utils/formStatus";
import { handleTiltLeave, handleTiltMove } from "../../utils/tilt";

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" });

type CardAccent = "brand" | "emerald" | "amber";

const ACCENT_STYLES: Record<CardAccent, { bar: string; glow: string; text: string; iconBg: string }> = {
  brand: {
    bar: "from-brand-500 to-brand-700",
    glow: "hover:shadow-brand-500/25",
    text: "text-brand-700",
    iconBg: "bg-brand-100",
  },
  emerald: {
    bar: "from-emerald-400 to-emerald-600",
    glow: "hover:shadow-emerald-500/25",
    text: "text-emerald-600",
    iconBg: "bg-emerald-100",
  },
  amber: {
    bar: "from-amber-400 to-amber-600",
    glow: "hover:shadow-amber-500/25",
    text: "text-amber-600",
    iconBg: "bg-amber-100",
  },
};

interface SummaryCardProps {
  label: string;
  value: number;
  accent?: CardAccent;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const SummaryCard = ({ label, value, accent = "brand", icon: Icon }: SummaryCardProps) => {
  const style = ACCENT_STYLES[accent];

  return (
    <div
      className={`group overflow-hidden rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl transition-shadow duration-300 hover:shadow-xl will-change-transform ${style.glow}`}
      onMouseMove={handleTiltMove}
      onMouseLeave={handleTiltLeave}
    >
      <div className={`h-1.5 w-full bg-gradient-to-r ${style.bar}`} />
      <div className="flex items-start justify-between gap-3 p-6">
        <div>
          <p className="text-sm font-medium text-neutral-500">{label}</p>
          <p
            className={`mt-2 text-4xl font-bold transition-transform duration-300 group-hover:scale-110 ${style.text}`}
          >
            <AnimatedNumber value={value} />
          </p>
        </div>
        <span
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${style.iconBg} transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110`}
        >
          <Icon className={`h-5 w-5 ${style.text}`} />
        </span>
      </div>
    </div>
  );
};

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
          className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-brand-600 via-emerald-500 to-brand-600 bg-[length:200%_auto] bg-[position:0%_50%] px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:bg-[position:100%_50%] hover:animate-neonPulse active:scale-95 shadow-[0_0_10px_1px_rgba(16,185,129,0.35)] ring-1 ring-inset ring-emerald-300/30 hover:ring-2 hover:ring-emerald-300/80"
        >
          + Nuevo formulario
        </Link>
      </div>

      {error && <Alert message={error} />}

      {isLoading ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <SkeletonList rows={3} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard
              label="Formularios creados"
              value={totalForms}
              accent="brand"
              icon={DocumentIcon}
            />
            <SummaryCard
              label="Formularios activos"
              value={activeForms}
              accent="emerald"
              icon={CheckCircleIcon}
            />
            <SummaryCard
              label="Respuestas recibidas"
              value={totalResponses}
              accent="amber"
              icon={ChatIcon}
            />
          </div>

          {forms.length === 0 ? (
            <EmptyState icon={DocumentIcon} message="Aun no has creado ningun formulario." />
          ) : (
            <div className="space-y-4">
              {forms.map((form) => (
                <div
                  key={form.id}
                  className="rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-5 transition-shadow duration-300 will-change-transform hover:border-brand-200 hover:shadow-xl hover:shadow-brand-500/10"
                  onMouseMove={handleTiltMove}
                  onMouseLeave={handleTiltLeave}
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
                        className="rounded-lg border-2 border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 hover:shadow-md"
                      >
                        Ver respuestas
                      </Link>
                      <Link
                        to={`/teacher/forms/${form.id}/edit`}
                        className="rounded-lg border-2 border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 hover:shadow-md"
                      >
                        Editar
                      </Link>
                      {form.status !== "ARCHIVED" && (
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(form)}
                          disabled={updatingId === form.id}
                          className="rounded-lg border-2 border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 hover:shadow-md disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {form.status === "ACTIVE" ? "Cerrar" : "Activar"}
                        </button>
                      )}
                      {form.status !== "ARCHIVED" && (
                        <button
                          type="button"
                          onClick={() => handleArchive(form)}
                          disabled={updatingId === form.id}
                          className="rounded-lg border-2 border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-red-400 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60"
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
