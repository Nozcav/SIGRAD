import { Form, FormStatus, Prisma } from "@prisma/client";
import { prisma } from "../../config/db";
import { AppError } from "../../utils/AppError";
import { generateUniqueFormCode } from "../../utils/generateFormCode";
import { CreateFormInput, UpdateFormInput } from "./forms.schemas";

const formWithQuestionsInclude = {
  questions: {
    orderBy: { order: "asc" as const },
    include: {
      options: { orderBy: { order: "asc" as const } },
    },
  },
} satisfies Prisma.FormInclude;

const buildQuestionsCreateInput = (
  questions: CreateFormInput["questions"]
): Prisma.QuestionCreateWithoutFormInput[] => {
  return questions.map((question, index) => ({
    text: question.text,
    type: question.type,
    required: question.required,
    order: index,
    options: question.options
      ? {
          create: question.options.map((option, optionIndex) => ({
            text: option.text,
            order: optionIndex,
          })),
        }
      : undefined,
  }));
};

const findFormWithDetailsOrThrow = async (formId: string) => {
  const form = await prisma.form.findUnique({
    where: { id: formId },
    include: {
      ...formWithQuestionsInclude,
      _count: { select: { responses: true } },
    },
  });

  if (!form) {
    throw new AppError("Formulario no encontrado", 404);
  }

  return form;
};

const assertOwnership = (form: Pick<Form, "teacherId">, teacherId: string) => {
  if (form.teacherId !== teacherId) {
    throw new AppError("No tienes permiso sobre este formulario", 403);
  }
};

export const createForm = async (teacherId: string, input: CreateFormInput) => {
  const code = await generateUniqueFormCode();

  return prisma.form.create({
    data: {
      title: input.title,
      description: input.description,
      code,
      teacherId,
      questions: {
        create: buildQuestionsCreateInput(input.questions),
      },
    },
    include: formWithQuestionsInclude,
  });
};

export const listFormsByTeacher = async (teacherId: string) => {
  const forms = await prisma.form.findMany({
    where: { teacherId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { responses: true } },
    },
  });

  return forms.map((form) => ({
    id: form.id,
    title: form.title,
    description: form.description,
    code: form.code,
    status: form.status,
    createdAt: form.createdAt,
    updatedAt: form.updatedAt,
    responseCount: form._count.responses,
  }));
};

export const getFormForTeacher = async (teacherId: string, formId: string) => {
  const form = await findFormWithDetailsOrThrow(formId);
  assertOwnership(form, teacherId);
  return form;
};

export const updateForm = async (teacherId: string, formId: string, input: UpdateFormInput) => {
  const existingForm = await findFormWithDetailsOrThrow(formId);
  assertOwnership(existingForm, teacherId);

  if (input.questions && existingForm._count.responses > 0) {
    throw new AppError(
      "No se pueden modificar las preguntas de un formulario que ya tiene respuestas. Cierra o archiva este formulario y crea uno nuevo si necesitas cambiar sus preguntas.",
      400
    );
  }

  const form = await prisma.$transaction(async (tx) => {
    if (input.questions) {
      await tx.question.deleteMany({ where: { formId } });
    }

    return tx.form.update({
      where: { id: formId },
      data: {
        title: input.title,
        description: input.description,
        questions: input.questions
          ? { create: buildQuestionsCreateInput(input.questions) }
          : undefined,
      },
      include: formWithQuestionsInclude,
    });
  });

  return form;
};

export const archiveForm = async (teacherId: string, formId: string) => {
  const form = await prisma.form.findUnique({ where: { id: formId } });

  if (!form) {
    throw new AppError("Formulario no encontrado", 404);
  }

  assertOwnership(form, teacherId);

  return prisma.form.update({
    where: { id: formId },
    data: { status: FormStatus.ARCHIVED },
  });
};

export const updateFormStatus = async (teacherId: string, formId: string, status: FormStatus) => {
  const form = await prisma.form.findUnique({ where: { id: formId } });

  if (!form) {
    throw new AppError("Formulario no encontrado", 404);
  }

  assertOwnership(form, teacherId);

  return prisma.form.update({
    where: { id: formId },
    data: { status },
  });
};

export const getFormByCodeForStudent = async (code: string) => {
  const form = await prisma.form.findUnique({
    where: { code },
    include: formWithQuestionsInclude,
  });

  if (!form) {
    throw new AppError("El codigo ingresado no corresponde a ningun formulario", 404);
  }

  if (form.status !== FormStatus.ACTIVE) {
    throw new AppError("Este formulario no esta disponible actualmente", 403);
  }

  return form;
};
