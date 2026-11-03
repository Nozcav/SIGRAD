import { z } from "zod";
import { documentIdSchema, fullNameSchema } from "../../utils/validationSchemas";

export const loginSchema = z.object({
  email: z.string().trim().email("Correo invalido"),
  password: z.string().min(1, "La contrasena es requerida"),
});

export const updateProfileSchema = z.object({
  fullName: fullNameSchema,
  documentId: documentIdSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "La contrasena actual es requerida"),
  newPassword: z.string().min(8, "La nueva contrasena debe tener al menos 8 caracteres").max(72),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
