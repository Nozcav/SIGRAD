import { RequestHandler } from "express";
import { prisma } from "../config/db";
import { AppError } from "../utils/AppError";
import { verifyToken } from "../utils/jwt";

export const requireAuth: RequestHandler = async (req, _res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      throw new AppError("No autenticado", 401);
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw new AppError("Sesion invalida o expirada", 401);
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });

    if (!user) {
      throw new AppError("No autenticado", 401);
    }

    if (!user.active) {
      throw new AppError("Tu cuenta ha sido desactivada", 403);
    }

    req.user = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      documentId: user.documentId,
      role: user.role,
      active: user.active,
      mustChangePassword: user.mustChangePassword,
    };

    next();
  } catch (error) {
    next(error);
  }
};
