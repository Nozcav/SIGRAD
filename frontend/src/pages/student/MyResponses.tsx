import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Alert } from "../../components/ui/Alert";
import { Badge } from "../../components/ui/Badge";
import { getApiErrorMessage } from "../../lib/api";
import { getMyResponses } from "../../services/responses.service";
import { ResponseSummary } from "../../types/response";
import { RESPONSE_STATUS_LABELS, RESPONSE_STATUS_VARIANTS } from "../../utils/responseStatus";

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const MyResponses = () => {
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Mis respuestas</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Historial de los formularios que has diligenciado.
        </p>
      </div>

      {error && <Alert message={error} />}

      {isLoading ? (
        <p className="text-sm text-neutral-500">Cargando...</p>
      ) : responses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
          Aun no has enviado respuestas a ningun formulario.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
          <table className="min-w-full divide-y divide-neutral-200 text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Formulario</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Codigo</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Enviado</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Estado</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Comentarios</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {responses.map((response) => (
                <tr key={response.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-neutral-900">{response.form.title}</td>
                  <td className="px-4 py-3 font-mono text-neutral-500">{response.form.code}</td>
                  <td className="px-4 py-3 text-neutral-500">{formatDate(response.submittedAt)}</td>
                  <td className="px-4 py-3">
                    <Badge
                      label={RESPONSE_STATUS_LABELS[response.status]}
                      variant={RESPONSE_STATUS_VARIANTS[response.status]}
                      pulse={response.status === "PENDING"}
                    />
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{response.commentCount}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/student/responses/${response.id}`}
                      className="font-medium text-brand-700 hover:text-brand-800"
                    >
                      Ver detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyResponses;
