import { Role } from "@prisma/client";
import { z } from "zod";

export const updateRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

export const updateStatusSchema = z.object({
  active: z.boolean(),
});

// El panel de administracion solo puede crear cuentas de estudiante o
// docente. El rol de administrador se asigna fuera del sistema (seed/BD)
// para evitar escalar privilegios por un formulario.
export const createUserSchema = z.object({
  fullName: z.string().trim().min(3, "El nombre debe tener al menos 3 caracteres").max(120),
  email: z.string().trim().email("Correo invalido"),
  documentId: z.string().trim().min(5, "Documento invalido").max(30),
  role: z.enum([Role.STUDENT, Role.TEACHER]),
  // Si se omite, el sistema genera una contrasena temporal aleatoria.
  password: z
    .string()
    .min(8, "La contrasena debe tener al menos 8 caracteres")
    .max(72)
    .optional(),
});

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
