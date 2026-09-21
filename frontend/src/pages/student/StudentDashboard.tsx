import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FormCodeEntry } from "../../components/student/FormCodeEntry";
import { Alert } from "../../components/ui/Alert";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../lib/api";
import { getNotifications, markNotificationAsRead } from "../../services/notifications.service";
import { getMyResponses } from "../../services/responses.service";
import { AppNotification } from "../../types/notification";
import { ResponseSummary } from "../../types/response";

const formatDateTime = (isoDate: string) =>
  new Date(isoDate).toLocaleString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

interface SummaryCardProps {
  label: string;
  value: number;
  to?: string;
  pulse?: boolean;
}

const SummaryCard = ({ label, value, to, pulse = false }: SummaryCardProps) => {
  const content = (
    <>
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-neutral-500">{label}</p>
        {pulse && value > 0 && <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />}
      </div>
      <p className="mt-2 text-3xl font-semibold text-neutral-900">{value}</p>
    </>
  );

  const className =
    "block rounded-2xl border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-md";

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
};

const StudentDashboard = () => {
  const { user } = useAuth();

  const [responses, setResponses] = useState<ResponseSummary[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [responsesData, notificationsData] = await Promise.all([
          getMyResponses(),
          getNotifications(),
        ]);
        setResponses(responsesData);
        setNotifications(notificationsData);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    setMarkingId(notificationId);

    try {
      const updated = await markNotificationAsRead(notificationId);
      setNotifications((previous) =>
        previous.map((notification) => (notification.id === updated.id ? updated : notification))
      );
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setMarkingId(null);
    }
  };

  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const commentCount = responses.reduce((total, response) => total + response.commentCount, 0);
  const pendingCount = responses.filter(
    (response) => response.status === "NEEDS_CORRECTION" || response.hasUnreadFeedback
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Hola, {user?.fullName}</h1>
        <p className="mt-1 text-sm text-neutral-500">Este es tu panel de estudiante en SIGRAD.</p>
      </div>

      {error && <Alert message={error} />}

      {isLoading ? (
        <p className="text-sm text-neutral-500">Cargando...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Formularios respondidos" value={responses.length} />
            <SummaryCard label="Comentarios recibidos" value={commentCount} />
            <SummaryCard label="Notificaciones no leidas" value={unreadCount} />
            <SummaryCard
              label="Comentarios pendientes"
              value={pendingCount}
              to="/student/pending"
              pulse
            />
          </div>

          <FormCodeEntry />

          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-neutral-900">Notificaciones</h2>

            {notifications.length === 0 ? (
              <p className="mt-3 text-sm text-neutral-500">No tienes notificaciones todavia.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={`flex flex-col gap-2 rounded-lg border p-4 transition-shadow hover:shadow-md sm:flex-row sm:items-center sm:justify-between ${
                      notification.read
                        ? "border-neutral-200 bg-white"
                        : "border-brand-200 bg-brand-50"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {!notification.read && (
                        <span className="mt-1.5 h-2 w-2 flex-shrink-0 animate-pulse rounded-full bg-brand-600" />
                      )}
                      <div>
                        <p className="text-sm text-neutral-800">{notification.message}</p>
                        <p className="mt-1 text-xs text-neutral-500">
                          {formatDateTime(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                    {!notification.read && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={markingId === notification.id}
                        className="self-start rounded-lg border border-brand-300 px-3 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
                      >
                        {markingId === notification.id ? "Marcando..." : "Marcar como leida"}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StudentDashboard;
