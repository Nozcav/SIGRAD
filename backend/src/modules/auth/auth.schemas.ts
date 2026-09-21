import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().trim().min(3, "El nombre debe tener al menos 3 caracteres").max(120),
  email: z.string().trim().email("Correo invalido"),
  documentId: z.string().trim().min(5, "Documento invalido").max(30),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres").max(72),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Correo invalido"),
  password: z.string().min(1, "La contrasena es requerida"),
});

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(3, "El nombre debe tener al menos 3 caracteres").max(120),
  documentId: z.string().trim().min(5, "Documento invalido").max(30),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "La contrasena actual es requerida"),
  newPassword: z.string().min(8, "La nueva contrasena debe tener al menos 8 caracteres").max(72),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
