import { Role } from "@prisma/client";
import { z } from "zod";
import {
  documentIdSchema,
  fullNameSchema,
  institutionalEmailSchema,
} from "../../utils/validationSchemas";

export const updateRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

export const updateStatusSchema = z.object({
  active: z.boolean(),
});

export const userIdParamsSchema = z.object({
  id: z.string().uuid("Identificador de usuario invalido"),
});

// El panel de administracion solo puede crear cuentas de estudiante o
// docente. El rol de administrador se asigna fuera del sistema (seed/BD)
// para evitar escalar privilegios por un formulario.
export const createUserSchema = z.object({
  fullName: fullNameSchema,
  email: institutionalEmailSchema,
  documentId: documentIdSchema,
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
