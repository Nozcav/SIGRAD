import { FormStatus, QuestionType } from "@prisma/client";
import { z } from "zod";

const SELECTION_TYPES = [
  QuestionType.SINGLE_CHOICE,
  QuestionType.MULTIPLE_CHOICE,
  QuestionType.DROPDOWN,
];

const questionOptionSchema = z.object({
  text: z.string().trim().min(1, "El texto de la opcion es requerido").max(200),
});

const questionSchema = z
  .object({
    text: z.string().trim().min(1, "El texto de la pregunta es requerido").max(500),
    type: z.nativeEnum(QuestionType),
    required: z.boolean().default(true),
    options: z.array(questionOptionSchema).max(20).optional(),
  })
  .superRefine((question, ctx) => {
    const needsOptions = (SELECTION_TYPES as QuestionType[]).includes(question.type);

    if (needsOptions && (!question.options || question.options.length < 2)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Las preguntas de seleccion unica, multiple o lista desplegable requieren al menos 2 opciones",
        path: ["options"],
      });
    }

    if (!needsOptions && question.options && question.options.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Este tipo de pregunta no admite opciones",
        path: ["options"],
      });
    }
  });

export const createFormSchema = z.object({
  title: z.string().trim().min(3, "El titulo debe tener al menos 3 caracteres").max(200),
  description: z.string().trim().max(2000).optional(),
  questions: z
    .array(questionSchema)
    .min(1, "El formulario debe tener al menos una pregunta")
    .max(100),
});

export const updateFormSchema = z
  .object({
    title: z.string().trim().min(3, "El titulo debe tener al menos 3 caracteres").max(200).optional(),
    description: z.string().trim().max(2000).optional(),
    questions: z
      .array(questionSchema)
      .min(1, "El formulario debe tener al menos una pregunta")
      .max(100)
      .optional(),
  })
  .refine((data) => data.title !== undefined || data.description !== undefined || data.questions !== undefined, {
    message: "Debes proporcionar al menos un campo para actualizar",
  });

export const updateStatusSchema = z.object({
  status: z.nativeEnum(FormStatus),
});

export type CreateFormInput = z.infer<typeof createFormSchema>;
export type UpdateFormInput = z.infer<typeof updateFormSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
