import { ResponseStatus } from "@prisma/client";
import { z } from "zod";

const answerSchema = z.object({
  questionId: z.string().min(1, "questionId es requerido"),
  value: z.union([z.string(), z.array(z.string())]),
});

export const submitResponseSchema = z.object({
  formId: z.string().min(1, "formId es requerido"),
  answers: z.array(answerSchema).min(1, "Debes enviar al menos una respuesta"),
});

export const updateResponseStatusSchema = z.object({
  status: z.nativeEnum(ResponseStatus),
});

export type SubmitResponseInput = z.infer<typeof submitResponseSchema>;
export type UpdateResponseStatusInput = z.infer<typeof updateResponseStatusSchema>;
