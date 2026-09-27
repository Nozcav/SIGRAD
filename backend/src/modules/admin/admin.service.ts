import { Role, User } from "@prisma/client";
import { prisma } from "../../config/db";
import { env } from "../../config/env";
import { AppError } from "../../utils/AppError";
import { generateTemporaryPassword } from "../../utils/generateTemporaryPassword";
import { hashPassword } from "../../utils/hash";
import { CreateUserInput } from "./admin.schemas";

const sanitizeUser = (user: User) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  documentId: user.documentId,
  role: user.role,
  active: user.active,
  mustChangePassword: user.mustChangePassword,
  createdAt: user.createdAt,
});

export const listUsers = async () => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return users.map(sanitizeUser);
};

// Este panel solo permite alternar entre estudiante y docente. El rol de
// administrador no se asigna ni se retira desde aqui: es una decision que
// requiere acceso directo a la base de datos, para evitar que un error de
// clic escale privilegios de administrador.
const TOGGLEABLE_ROLES: Role[] = [Role.STUDENT, Role.TEACHER];

export const updateUserRole = async (adminId: string, userId: string, role: Role) => {
  if (!TOGGLEABLE_ROLES.includes(role)) {
    throw new AppError(
      "Desde este panel solo se puede asignar el rol de estudiante o docente",
      400
    );
  }

  if (userId === adminId) {
    throw new AppError("No puedes modificar tu propio rol", 400);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }

  if (user.role === Role.ADMIN) {
    throw new AppError("No se puede modificar el rol de un administrador desde este panel", 400);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role },
  });

  return sanitizeUser(updated);
};

export const updateUserStatus = async (adminId: string, userId: string, active: boolean) => {
  if (userId === adminId) {
    throw new AppError("No puedes desactivar tu propia cuenta", 400);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { active },
  });

  return sanitizeUser(updated);
};

// No existe registro publico: el administrador es quien da de alta cada
// cuenta (replica el modelo institucional donde la universidad entrega las
// credenciales). Si el admin no especifica una contrasena, el sistema genera
// una temporal segura. En ambos casos se devuelve una unica vez en texto
// plano (nunca se guarda asi) y el usuario debe reemplazarla en su primer
// inicio de sesion (mustChangePassword).
export const createUser = async (input: CreateUserInput) => {
  const normalizedEmail = input.email.toLowerCase();

  if (env.EMAIL_DOMAIN && !normalizedEmail.endsWith(`@${env.EMAIL_DOMAIN.toLowerCase()}`)) {
    throw new AppError(
      `El correo debe pertenecer al dominio institucional (@${env.EMAIL_DOMAIN})`,
      400
    );
  }

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email: normalizedEmail }, { documentId: input.documentId }],
    },
  });

  if (existing) {
    throw new AppError("Ya existe un usuario registrado con ese correo o documento", 409);
  }

  const temporaryPassword = input.password ?? generateTemporaryPassword();
  const passwordHash = await hashPassword(temporaryPassword);

  const user = await prisma.user.create({
    data: {
      fullName: input.fullName,
      email: normalizedEmail,
      documentId: input.documentId,
      role: input.role,
      passwordHash,
      mustChangePassword: true,
    },
  });

  return { user: sanitizeUser(user), temporaryPassword };
};
