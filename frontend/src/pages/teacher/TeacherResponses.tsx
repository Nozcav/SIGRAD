import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Alert } from "../../components/ui/Alert";
import { Badge } from "../../components/ui/Badge";
import { getApiErrorMessage } from "../../lib/api";
import { getResponsesForForm } from "../../services/forms.service";
import { TeacherResponseSummary } from "../../types/response";
import { RESPONSE_STATUS_LABELS, RESPONSE_STATUS_VARIANTS } from "../../utils/responseStatus";

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" });

const TeacherResponses = () => {
  const { formId } = useParams<{ formId: string }>();

  const [responses, setResponses] = useState<TeacherResponseSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!formId) {
      return;
    }

    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getResponsesForForm(formId);
        setResponses(data);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [formId]);

  return (
    <div className="space-y-6">
      <div>
        <Link to="/teacher" className="text-sm font-medium text-brand-700 hover:text-brand-800">
          Volver a mis formularios
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-neutral-900">Respuestas recibidas</h1>
      </div>

      {error && <Alert message={error} />}

      {isLoading ? (
        <p className="text-sm text-neutral-500">Cargando...</p>
      ) : responses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-8 text-center text-sm text-neutral-500">
          Todavia no se han recibido respuestas para este formulario.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white">
          <table className="min-w-full divide-y divide-neutral-200 text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Estudiante</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Correo</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Enviado</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Estado</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-500">Comentarios</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {responses.map((response) => (
                <tr key={response.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    {response.student.fullName}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{response.student.email}</td>
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
                      to={`/teacher/responses/${response.id}`}
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

export default TeacherResponses;
