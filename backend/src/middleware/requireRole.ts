import { RequestHandler } from "express";
import { Role } from "@prisma/client";
import { AppError } from "../utils/AppError";

export const requireRole = (allowedRoles: Role[]): RequestHandler => {
  return (req, _res, next) => {
    if (!req.user) {
      next(new AppError("No autenticado", 401));
      return;
    }

    if (req.user.mustChangePassword) {
      next(new AppError("Debes cambiar tu contrasena temporal antes de continuar", 403));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError("No tienes permisos para realizar esta accion", 403));
      return;
    }

    next();
  };
};
