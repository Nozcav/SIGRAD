import { FormStatus } from "../types/form";

export const FORM_STATUS_LABELS: Record<FormStatus, string> = {
  ACTIVE: "Activo",
  CLOSED: "Cerrado",
  ARCHIVED: "Archivado",
};

export const FORM_STATUS_VARIANTS: Record<FormStatus, "green" | "amber" | "neutral"> = {
  ACTIVE: "green",
  CLOSED: "amber",
  ARCHIVED: "neutral",
};
