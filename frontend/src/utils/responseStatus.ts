import { ResponseStatus } from "../types/response";

export const RESPONSE_STATUS_LABELS: Record<ResponseStatus, string> = {
  PENDING: "Pendiente de revision",
  REVIEWED: "Revisada",
  NEEDS_CORRECTION: "Requiere correccion",
};

export const RESPONSE_STATUS_VARIANTS: Record<ResponseStatus, "amber" | "green" | "red"> = {
  PENDING: "amber",
  REVIEWED: "green",
  NEEDS_CORRECTION: "red",
};
