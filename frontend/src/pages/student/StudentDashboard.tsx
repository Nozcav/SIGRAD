import { ComponentType, SVGProps, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FormCodeEntry } from "../../components/student/FormCodeEntry";
import { AnimatedNumber } from "../../components/ui/AnimatedNumber";
import { Alert } from "../../components/ui/Alert";
import { SkeletonBlock } from "../../components/ui/SkeletonBlock";
import { SkeletonCard } from "../../components/ui/SkeletonCard";
import { SkeletonList } from "../../components/ui/SkeletonList";
import { BellIcon, ChatIcon, ClockIcon, DocumentIcon } from "../../components/icons/Icons";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../lib/api";
import { getNotifications, markNotificationAsRead } from "../../services/notifications.service";
import { getMyResponses } from "../../services/responses.service";
import { AppNotification } from "../../types/notification";
import { ResponseSummary } from "../../types/response";
import { handleTiltLeave, handleTiltMove } from "../../utils/tilt";

const formatDateTime = (isoDate: string) =>
  new Date(isoDate).toLocaleString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

type CardAccent = "brand" | "emerald" | "amber" | "red";

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
  red: {
    bar: "from-red-400 to-red-600",
    glow: "hover:shadow-red-500/25",
    text: "text-red-600",
    iconBg: "bg-red-100",
  },
};

interface SummaryCardProps {
  label: string;
  value: number;
  to?: string;
  pulse?: boolean;
  accent?: CardAccent;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

const SummaryCard = ({
  label,
  value,
  to,
  pulse = false,
  accent = "brand",
  icon: Icon,
}: SummaryCardProps) => {
  const style = ACCENT_STYLES[accent];

  const content = (
    <>
      <div className={`h-1.5 w-full bg-gradient-to-r ${style.bar}`} />
      <div className="flex items-start justify-between gap-3 p-6">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-neutral-500">{label}</p>
            {pulse && value > 0 && (
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            )}
          </div>
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
    </>
  );

  const className = `group block overflow-hidden rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl transition-shadow duration-300 hover:shadow-xl will-change-transform ${style.glow}`;

  if (to) {
    return (
      <Link
        to={to}
        className={className}
        onMouseMove={handleTiltMove}
        onMouseLeave={handleTiltLeave}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={className} onMouseMove={handleTiltMove} onMouseLeave={handleTiltLeave}>
      {content}
    </div>
  );
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

  useEffect(() => {
    let isMounted = true;
    const refreshNotifications = async () => {
      try {
        const data = await getNotifications();
        if (isMounted) {
          setNotifications(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(getApiErrorMessage(err));
        }
      }
    };

    const intervalId = window.setInterval(() => void refreshNotifications(), 30_000);
    window.addEventListener("focus", refreshNotifications);
    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshNotifications);
    };
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
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <SkeletonBlock lines={2} />
          <SkeletonList rows={3} />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              label="Formularios respondidos"
              value={responses.length}
              accent="brand"
              icon={DocumentIcon}
            />
            <SummaryCard
              label="Comentarios recibidos"
              value={commentCount}
              accent="emerald"
              icon={ChatIcon}
            />
            <SummaryCard
              label="Notificaciones no leidas"
              value={unreadCount}
              accent="amber"
              icon={BellIcon}
            />
            <SummaryCard
              label="Comentarios pendientes"
              value={pendingCount}
              to="/student/pending"
              pulse
              accent="red"
              icon={ClockIcon}
            />
          </div>

          <FormCodeEntry />

          <div className="rounded-2xl border border-white/60 bg-white/70 p-6 backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-neutral-900">Notificaciones</h2>

            {notifications.length === 0 ? (
              <p className="mt-3 text-sm text-neutral-500">No tienes notificaciones todavia.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={`flex flex-col gap-2 rounded-lg border p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-500/10 sm:flex-row sm:items-center sm:justify-between ${
                      notification.read
                        ? "border-neutral-200/70 bg-white/60 backdrop-blur-md"
                        : "border-brand-200 bg-brand-50/90 backdrop-blur-md"
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
                        {notification.responseId && (
                          <Link
                            to={`/student/responses/${notification.responseId}`}
                            className="mt-2 inline-block text-xs font-semibold text-brand-700 hover:text-brand-800"
                          >
                            Ver respuesta y calificación
                          </Link>
                        )}
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
