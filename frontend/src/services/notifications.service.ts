import { api } from "../lib/api";
import { AppNotification } from "../types/notification";

export const getNotifications = async (): Promise<AppNotification[]> => {
  const { data } = await api.get<{ notifications: AppNotification[] }>("/notifications");
  return data.notifications;
};

export const markNotificationAsRead = async (id: string): Promise<AppNotification> => {
  const { data } = await api.patch<{ notification: AppNotification }>(`/notifications/${id}/read`);
  return data.notification;
};
