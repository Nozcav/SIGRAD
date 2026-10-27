import { z } from "zod";

const groupPayloadSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  responseIds: z.array(z.string().uuid()).min(1, "Selecciona al menos un estudiante").max(500),
}).superRefine(({ responseIds }, ctx) => {
  if (new Set(responseIds).size !== responseIds.length) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "No repitas estudiantes", path: ["responseIds"] });
  }
});

export const createGroupSchema = groupPayloadSchema;
export const updateGroupSchema = groupPayloadSchema;

const assessmentCriterionSchema = z.object({
  name: z.string().trim().min(2, "El criterio debe tener al menos 2 caracteres").max(150),
  weight: z.number().int().min(1).max(100),
});

export const saveAssessmentSchema = z.object({
  criteria: z.array(assessmentCriterionSchema).min(1).max(20),
}).superRefine(({ criteria }, ctx) => {
  const totalWeight = criteria.reduce((total, criterion) => total + criterion.weight, 0);
  if (totalWeight !== 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Los porcentajes deben sumar 100%. Actualmente suman ${totalWeight}%.`,
      path: ["criteria"],
    });
  }
  if (new Set(criteria.map(({ name }) => name.toLocaleLowerCase())).size !== criteria.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "No repitas nombres de criterios.",
      path: ["criteria"],
    });
  }
});

export const saveGradesSchema = z.object({
  grades: z.array(z.object({
    criterionId: z.string().uuid(),
    responseId: z.string().uuid(),
    score: z.number()
      .min(0, "La nota mínima es 0,0.")
      .max(5, "La nota máxima es 5,0.")
      .refine(
        (score) => Math.abs(score * 10 - Math.round(score * 10)) < 1e-8,
        "La nota solo puede tener un decimal."
      )
      .nullable(),
  })).min(1).max(10000),
}).superRefine(({ grades }, ctx) => {
  const keys = grades.map(({ criterionId, responseId }) => `${criterionId}:${responseId}`);
  if (new Set(keys).size !== keys.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "No repitas calificaciones para el mismo estudiante y criterio.",
      path: ["grades"],
    });
  }
});

export type SaveAssessmentInput = z.infer<typeof saveAssessmentSchema>;
export type SaveGradesInput = z.infer<typeof saveGradesSchema>;