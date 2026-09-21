import { User } from "@prisma/client";
import { prisma } from "../../config/db";
import { AppError } from "../../utils/AppError";
import { comparePassword, hashPassword } from "../../utils/hash";
import { signToken } from "../../utils/jwt";
import { env } from "../../config/env";
import { ChangePasswordInput, LoginInput, RegisterInput, UpdateProfileInput } from "./auth.schemas";

const sanitizeUser = (user: User) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  documentId: user.documentId,
  role: user.role,
  active: user.active,
  createdAt: user.createdAt,
});

export const registerUser = async (input: RegisterInput) => {
  const normalizedEmail = input.email.toLowerCase();

  if (
    env.EMAIL_DOMAIN &&
    !normalizedEmail.endsWith(`@${env.EMAIL_DOMAIN.toLowerCase()}`)
  ) {
    throw new AppError(
      `Debes registrarte con tu correo institucional (@${env.EMAIL_DOMAIN})`,
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

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      fullName: input.fullName,
      email: normalizedEmail,
      documentId: input.documentId,
      passwordHash,
    },
  });

  const token = signToken(user.id);

  return { user: sanitizeUser(user), token };
};

export const updateUserProfile = async (userId: string, input: UpdateProfileInput) => {
  const existing = await prisma.user.findFirst({
    where: {
      documentId: input.documentId,
      NOT: { id: userId },
    },
  });

  if (existing) {
    throw new AppError("Ya existe un usuario registrado con ese documento", 409);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      fullName: input.fullName,
      documentId: input.documentId,
    },
  });

  return sanitizeUser(user);
};

export const changeUserPassword = async (userId: string, input: ChangePasswordInput) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError("Usuario no encontrado", 404);
  }

  const validPassword = await comparePassword(input.currentPassword, user.passwordHash);

  if (!validPassword) {
    throw new AppError("La contrasena actual no es correcta", 401);
  }

  const passwordHash = await hashPassword(input.newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });
};

export const loginUser = async (input: LoginInput) => {
  const normalizedEmail = input.email.toLowerCase();

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user) {
    throw new AppError("Credenciales invalidas", 401);
  }

  if (!user.active) {
    throw new AppError("Tu cuenta ha sido desactivada. Contacta al administrador.", 403);
  }

  const validPassword = await comparePassword(input.password, user.passwordHash);

  if (!validPassword) {
    throw new AppError("Credenciales invalidas", 401);
  }

  const token = signToken(user.id);

  return { user: sanitizeUser(user), token };
};
