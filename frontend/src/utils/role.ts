import { Role } from "../types/auth";

export const ROLE_LABELS: Record<Role, string> = {
  STUDENT: "Estudiante",
  TEACHER: "Docente",
  ADMIN: "Administrador",
};

export const ROLE_VARIANTS: Record<Role, "brand" | "green" | "neutral"> = {
  STUDENT: "brand",
  TEACHER: "green",
  ADMIN: "neutral",
};
