import { RequestHandler } from "express";
import { AppError } from "../utils/AppError";

export const requirePasswordChanged: RequestHandler = (req, _res, next) => {
  if (req.user?.mustChangePassword) {
    next(new AppError("Debes cambiar tu contrasena temporal antes de continuar", 403));
    return;
  }

  next();
};
