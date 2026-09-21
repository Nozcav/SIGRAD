import { RequestHandler } from "express";
import { listNotificationsForUser, markNotificationAsRead } from "./notifications.service";

export const list: RequestHandler = async (req, res, next) => {
  try {
    const notifications = await listNotificationsForUser(req.user!.id);
    res.status(200).json({ notifications });
  } catch (error) {
    next(error);
  }
};

export const markAsRead: RequestHandler = async (req, res, next) => {
  try {
    const notification = await markNotificationAsRead(req.user!.id, req.params.id);
    res.status(200).json({ notification });
  } catch (error) {
    next(error);
  }
};
