import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircleIcon } from "../../components/icons/Icons";
import { Alert } from "../../components/ui/Alert";
import { Badge } from "../../components/ui/Badge";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonList } from "../../components/ui/SkeletonList";
import { getApiErrorMessage } from "../../lib/api";
import { getMyResponses } from "../../services/responses.service";
import { ResponseSummary } from "../../types/response";
import { RESPONSE_STATUS_LABELS, RESPONSE_STATUS_VARIANTS } from "../../utils/responseStatus";
import { handleTiltLeave, handleTiltMove } from "../../utils/tilt";

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" });

const isPending = (response: ResponseSummary) =>
  response.status === "NEEDS_CORRECTION" || response.hasUnreadFeedback;

const PendingComments = () => {
  const [responses, setResponses] = useState<ResponseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getMyResponses();
        setResponses(data);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const pendingResponses = responses.filter(isPending);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Comentarios pendientes</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Respuestas con retroalimentacion nueva o que requieren correccion.
        </p>
      </div>

      {error && <Alert message={error} />}

      {isLoading ? (
        <SkeletonList rows={3} />
      ) : pendingResponses.length === 0 ? (
        <EmptyState
          icon={CheckCircleIcon}
          message="Estas al dia. No tienes retroalimentacion pendiente por revisar."
        />
      ) : (
        <ul className="space-y-3">
          {pendingResponses.map((response) => (
            <li key={response.id}>
              <Link
                to={`/student/responses/${response.id}`}
                className="flex flex-col gap-3 rounded-2xl border border-brand-200/70 bg-brand-50/80 p-5 backdrop-blur-xl transition-shadow duration-300 will-change-transform hover:shadow-xl hover:shadow-brand-500/20 sm:flex-row sm:items-center sm:justify-between"
                onMouseMove={handleTiltMove}
                onMouseLeave={handleTiltLeave}
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold text-neutral-900">{response.form.title}</h2>
                    <Badge
                      label={RESPONSE_STATUS_LABELS[response.status]}
                      variant={RESPONSE_STATUS_VARIANTS[response.status]}
                      pulse={response.status === "PENDING"}
                    />
                    {response.hasUnreadFeedback && (
                      <Badge label="Comentario nuevo" variant="brand" pulse />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-neutral-500">
                    Codigo <span className="font-mono">{response.form.code}</span> - enviado el{" "}
                    {formatDate(response.submittedAt)}
                  </p>
                </div>
                <span className="font-medium text-brand-700">Ver detalle →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PendingComments;
