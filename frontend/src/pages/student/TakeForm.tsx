import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { QuestionField } from "../../components/student/QuestionField";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { getApiErrorMessage } from "../../lib/api";
import { getFormByCode } from "../../services/forms.service";
import { submitResponse } from "../../services/responses.service";
import { FormWithQuestions } from "../../types/form";

type AnswersState = Record<string, string | string[]>;

const isAnswerEmpty = (value: string | string[] | undefined): boolean => {
  if (value === undefined) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return value.trim() === "";
};

const TakeForm = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormWithQuestions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [answers, setAnswers] = useState<AnswersState>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!code) {
      return;
    }

    (async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const fetchedForm = await getFormByCode(code);
        setForm(fetchedForm);
      } catch (err) {
        setLoadError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [code]);

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers((previous) => ({ ...previous, [questionId]: value }));
    setFieldErrors((previous) => {
      if (!previous[questionId]) {
        return previous;
      }
      const next = { ...previous };
      delete next[questionId];
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    if (!form) {
      return;
    }

    const nextFieldErrors: Record<string, string> = {};

    for (const question of form.questions) {
      if (question.required && isAnswerEmpty(answers[question.id])) {
        nextFieldErrors[question.id] = "Esta pregunta es obligatoria";
      }
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      setSubmitError("Completa las preguntas obligatorias antes de enviar");
      return;
    }

    const payloadAnswers = form.questions
      .filter((question) => !isAnswerEmpty(answers[question.id]))
      .map((question) => ({
        questionId: question.id,
        value: answers[question.id],
      }));

    setIsSubmitting(true);

    try {
      const response = await submitResponse({ formId: form.id, answers: payloadAnswers });
      navigate(`/student/responses/${response.id}`, { replace: true });
    } catch (err) {
      setSubmitError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <p className="text-sm text-neutral-500">Buscando formulario...</p>;
  }

  if (loadError || !form) {
    return (
      <div className="mx-auto max-w-xl">
        <Alert message={loadError ?? "No se pudo cargar el formulario"} />
        <Link
          to="/student"
          className="mt-4 inline-block text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          Volver al panel
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="font-mono text-xs font-medium uppercase tracking-wide text-brand-700">
          {form.code}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-neutral-900">{form.title}</h1>
        {form.description && <p className="mt-2 text-neutral-600">{form.description}</p>}
      </div>

      {submitError && <Alert message={submitError} />}

      <form
        className="space-y-6 rounded-2xl border border-neutral-200 bg-white p-6"
        onSubmit={handleSubmit}
        noValidate
      >
        {form.questions.map((question) => (
          <QuestionField
            key={question.id}
            question={question}
            value={answers[question.id]}
            onChange={(value) => handleAnswerChange(question.id, value)}
            error={fieldErrors[question.id]}
          />
        ))}

        <Button type="submit" isLoading={isSubmitting}>
          Enviar respuestas
        </Button>
      </form>
    </div>
  );
};

export default TakeForm;
