import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Alert } from "../../components/ui/Alert";
import { Badge } from "../../components/ui/Badge";
import { getApiErrorMessage } from "../../lib/api";
import { getResponseDetail } from "../../services/responses.service";
import { ResponseDetail as ResponseDetailType } from "../../types/response";
import { RESPONSE_STATUS_LABELS, RESPONSE_STATUS_VARIANTS } from "../../utils/responseStatus";

const formatDateTime = (isoDate: string) =>
  new Date(isoDate).toLocaleString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatAnswerValue = (value: string): string => {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.join(", ");
    }
  } catch {
    // El valor no es un JSON serializado (no es una seleccion multiple); se usa tal cual
  }
  return value;
};

const ResponseDetail = () => {
  const { id } = useParams<{ id: string }>();

  const [response, setResponse] = useState<ResponseDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    (async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getResponseDetail(id);
        setResponse(data);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  if (isLoading) {
    return <p className="text-sm text-neutral-500">Cargando...</p>;
  }

  if (error || !response) {
    return (
      <div className="mx-auto max-w-xl">
        <Alert message={error ?? "No se encontro la respuesta"} />
        <Link
          to="/student/responses"
          className="mt-4 inline-block text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          Volver a mis respuestas
        </Link>
      </div>
    );
  }

  const answersByQuestionId = new Map(
    response.answers.map((answer) => [answer.questionId, answer])
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          to="/student/responses"
          className="text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          Volver a mis respuestas
        </Link>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-mono text-xs font-medium uppercase tracking-wide text-brand-700">
              {response.form.code}
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-neutral-900">{response.form.title}</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Enviado el {formatDateTime(response.submittedAt)}
            </p>
          </div>
          <Badge
            label={RESPONSE_STATUS_LABELS[response.status]}
            variant={RESPONSE_STATUS_VARIANTS[response.status]}
            pulse={response.status === "PENDING"}
          />
        </div>
      </div>

      <div className="space-y-5 rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-neutral-900">Tus respuestas</h2>
        {response.form.questions.map((question) => {
          const answer = answersByQuestionId.get(question.id);
          return (
            <div
              key={question.id}
              className="border-t border-neutral-100 pt-4 first:border-t-0 first:pt-0"
            >
              <p className="text-sm font-medium text-neutral-700">{question.text}</p>
              <p className="mt-1 text-sm text-neutral-900">
                {answer ? (
                  formatAnswerValue(answer.value)
                ) : (
                  <span className="text-neutral-400">Sin respuesta</span>
                )}
              </p>
            </div>
          );
        })}
      </div>

      <div className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-neutral-900">Retroalimentacion del docente</h2>
        {response.comments.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Todavia no has recibido comentarios sobre esta respuesta.
          </p>
        ) : (
          <ul className="space-y-4">
            {response.comments.map((comment) => (
              <li key={comment.id} className="rounded-lg bg-neutral-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-neutral-900">{comment.teacher.fullName}</p>
                  <p className="text-xs text-neutral-500">{formatDateTime(comment.createdAt)}</p>
                </div>
                <p className="mt-2 text-sm text-neutral-700">{comment.text}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ResponseDetail;
