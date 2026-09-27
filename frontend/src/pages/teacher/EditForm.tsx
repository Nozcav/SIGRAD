import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FormBuilder, FormBuilderSubmitPayload } from "../../components/teacher/FormBuilder";
import { toBuilderQuestions } from "../../components/teacher/formBuilderTypes";
import { Alert } from "../../components/ui/Alert";
import { SkeletonBlock } from "../../components/ui/SkeletonBlock";
import { getApiErrorMessage } from "../../lib/api";
import { getFormForTeacher, updateForm } from "../../services/forms.service";
import { FormDetailForTeacher } from "../../types/form";

const EditForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormDetailForTeacher | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    (async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const data = await getFormForTeacher(id);
        setForm(data);
      } catch (err) {
        setLoadError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (payload: FormBuilderSubmitPayload) => {
    if (!id) {
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await updateForm(id, payload);
      navigate("/teacher", { replace: true });
    } catch (err) {
      setSubmitError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <SkeletonBlock lines={2} />
        <SkeletonBlock lines={3} />
        <SkeletonBlock lines={3} />
      </div>
    );
  }

  if (loadError || !form) {
    return (
      <div className="mx-auto max-w-xl">
        <Alert message={loadError ?? "No se pudo cargar el formulario"} />
        <Link
          to="/teacher"
          className="mt-4 inline-block text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          Volver al panel
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Editar formulario</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Codigo: <span className="font-mono">{form.code}</span>
        </p>
      </div>

      <FormBuilder
        initialTitle={form.title}
        initialDescription={form.description ?? ""}
        initialQuestions={toBuilderQuestions(form.questions)}
        questionsLocked={form._count.responses > 0}
        isSubmitting={isSubmitting}
        submitLabel="Guardar cambios"
        serverError={submitError}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default EditForm;
