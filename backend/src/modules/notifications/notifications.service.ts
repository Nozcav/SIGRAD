import { prisma } from "../../config/db";
import { AppError } from "../../utils/AppError";

export const listNotificationsForUser = async (userId: string) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const markNotificationAsRead = async (userId: string, notificationId: string) => {
  const notification = await prisma.notification.findUnique({ where: { id: notificationId } });

  if (!notification) {
    throw new AppError("Notificacion no encontrada", 404);
  }

  if (notification.userId !== userId) {
    throw new AppError("No tienes permiso sobre esta notificacion", 403);
  }

  if (notification.read) {
    return notification;
  }

  return prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
};
