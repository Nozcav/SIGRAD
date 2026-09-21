import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormBuilder, FormBuilderSubmitPayload } from "../../components/teacher/FormBuilder";
import { getApiErrorMessage } from "../../lib/api";
import { createForm } from "../../services/forms.service";

const CreateForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (payload: FormBuilderSubmitPayload) => {
    setError(null);
    setIsSubmitting(true);

    try {
      await createForm({
        title: payload.title,
        description: payload.description,
        questions: payload.questions ?? [],
      });
      navigate("/teacher", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Crear formulario</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Define el titulo, la descripcion y las preguntas que veran los estudiantes.
        </p>
      </div>

      <FormBuilder
        isSubmitting={isSubmitting}
        submitLabel="Crear formulario"
        serverError={error}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default CreateForm;
