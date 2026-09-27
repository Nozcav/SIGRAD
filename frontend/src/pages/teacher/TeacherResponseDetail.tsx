import { FormEvent, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import { Alert } from "../../components/ui/Alert";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { SkeletonBlock } from "../../components/ui/SkeletonBlock";
import { getApiErrorMessage } from "../../lib/api";
import { addComment } from "../../services/comments.service";
import { getResponseDetail, updateResponseStatus } from "../../services/responses.service";
import { Comment, ResponseDetail as ResponseDetailType, ResponseStatus } from "../../types/response";
import { celebrate } from "../../utils/celebrate";
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

const STATUS_OPTIONS: ResponseStatus[] = ["PENDING", "REVIEWED", "NEEDS_CORRECTION"];

const TeacherResponseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const [response, setResponse] = useState<ResponseDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [isCommenting, setIsCommenting] = useState(false);

  const [statusError, setStatusError] = useState<string | null>(null);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const data = await getResponseDetail(id);
        setResponse(data);
      } catch (err) {
        setLoadError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const handleAddComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCommentError(null);

    if (!response || commentText.trim().length === 0) {
      setCommentError("Escribe un comentario antes de enviarlo");
      return;
    }

    setIsCommenting(true);

    try {
      const comment: Comment = await addComment(response.id, commentText.trim());
      setResponse((previous) =>
        previous ? { ...previous, comments: [...previous.comments, comment] } : previous
      );
      setCommentText("");
      celebrate();
      showToast("Comentario enviado al estudiante", "success");
    } catch (err) {
      setCommentError(getApiErrorMessage(err));
    } finally {
      setIsCommenting(false);
    }
  };

  const handleStatusChange = async (nextStatus: ResponseStatus) => {
    if (!response || response.status === nextStatus) {
      return;
    }

    setStatusError(null);
    setIsChangingStatus(true);

    try {
      await updateResponseStatus(response.id, nextStatus);
      setResponse((previous) => (previous ? { ...previous, status: nextStatus } : previous));
      showToast(`Estado actualizado a "${RESPONSE_STATUS_LABELS[nextStatus]}"`, "success");
    } catch (err) {
      setStatusError(getApiErrorMessage(err));
    } finally {
      setIsChangingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <SkeletonBlock lines={2} />
        <SkeletonBlock lines={1} />
        <SkeletonBlock lines={4} />
        <SkeletonBlock lines={2} />
      </div>
    );
  }

  if (loadError || !response) {
    return (
      <div className="mx-auto max-w-xl">
        <Alert message={loadError ?? "No se encontro la respuesta"} />
        <Link
          to="/teacher"
          className="mt-4 inline-block text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          Volver al panel
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
          to={`/teacher/forms/${response.formId}/responses`}
          className="text-sm font-medium text-brand-700 hover:text-brand-800"
        >
          Volver a respuestas
        </Link>

        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs font-medium uppercase tracking-wide text-brand-700">
              {response.form.code}
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-neutral-900">{response.form.title}</h1>
            <p className="mt-1 text-sm text-neutral-500">
              {response.student.fullName} - {response.student.email}
            </p>
            <p className="text-sm text-neutral-500">
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

      <div className="space-y-3 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-6">
        <h2 className="text-lg font-semibold text-neutral-900">Estado de revision</h2>
        {statusError && <Alert message={statusError} />}
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => handleStatusChange(status)}
              disabled={isChangingStatus || response.status === status}
              className={`rounded-lg border-2 px-3 py-2 text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${
                response.status === status
                  ? "scale-105 border-brand-600 bg-gradient-to-r from-brand-600 to-emerald-500 text-white shadow-lg shadow-brand-500/30"
                  : "border-neutral-200 text-neutral-700 hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 hover:shadow-md"
              }`}
            >
              {RESPONSE_STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-5 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-6">
        <h2 className="text-lg font-semibold text-neutral-900">Respuestas del estudiante</h2>
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

      <div className="space-y-4 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-6">
        <h2 className="text-lg font-semibold text-neutral-900">Retroalimentacion</h2>

        {response.comments.length === 0 ? (
          <p className="text-sm text-neutral-500">Todavia no has dejado comentarios.</p>
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

        {commentError && <Alert message={commentError} />}

        <form className="space-y-3" onSubmit={handleAddComment} noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="comment" className="text-sm font-medium text-neutral-700">
              Nuevo comentario
            </label>
            <textarea
              id="comment"
              className="min-h-[100px] resize-y rounded-lg border-2 border-neutral-200 hover:border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 outline-none transition-all duration-200 focus:scale-[1.01] focus:border-transparent focus:ring-4 focus:ring-emerald-500/30"
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
            />
          </div>
          <Button type="submit" isLoading={isCommenting} className="sm:w-auto sm:px-8">
            Enviar comentario
          </Button>
        </form>
      </div>
    </div>
  );
};

export default TeacherResponseDetail;
