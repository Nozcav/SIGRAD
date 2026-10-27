import { FormStatus, Prisma, QuestionType, Role, ResponseStatus } from "@prisma/client";
import { prisma } from "../../config/db";
import { AppError } from "../../utils/AppError";
import { calculateWeightedGradeTenths } from "../../utils/weightedGrade";
import { SubmitResponseInput } from "./responses.schemas";

const SELECTION_TYPES: QuestionType[] = [QuestionType.SINGLE_CHOICE, QuestionType.DROPDOWN];

type QuestionWithOptions = {
  id: string;
  text: string;
  type: QuestionType;
  required: boolean;
  options: { id: string; text: string }[];
};

const isEmptyValue = (value: string | string[] | undefined): boolean => {
  if (value === undefined || value === null) {
    return true;
  }
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  return value.trim() === "";
};

// Valida el valor recibido contra el tipo de la pregunta y lo normaliza a un string
// listo para persistir (las selecciones multiples se guardan como JSON string).
const normalizeAnswerValue = (
  question: QuestionWithOptions,
  rawValue: string | string[] | undefined
): string | null => {
  if (isEmptyValue(rawValue)) {
    if (question.required) {
      throw new AppError(`La pregunta "${question.text}" es obligatoria`, 400);
    }
    return null;
  }

  // A partir de aqui rawValue esta garantizado no vacio por isEmptyValue()
  const value = rawValue as string | string[];

  if (question.type === QuestionType.MULTIPLE_CHOICE) {
    if (!Array.isArray(value)) {
      throw new AppError(`La pregunta "${question.text}" requiere una o mas opciones`, 400);
    }
    const validTexts = new Set(question.options.map((option) => option.text));
    const uniqueValues = Array.from(new Set(value.map((item) => item.trim())));
    const invalidOption = uniqueValues.find((value) => !validTexts.has(value));

    if (invalidOption) {
      throw new AppError(
        `La opcion "${invalidOption}" no es valida para la pregunta "${question.text}"`,
        400
      );
    }

    return JSON.stringify(uniqueValues);
  }

  if (SELECTION_TYPES.includes(question.type)) {
    if (Array.isArray(value)) {
      throw new AppError(`La pregunta "${question.text}" solo admite una opcion`, 400);
    }
    const trimmed = value.trim();
    const validTexts = new Set(question.options.map((option) => option.text));

    if (!validTexts.has(trimmed)) {
      throw new AppError(`La opcion "${trimmed}" no es valida para la pregunta "${question.text}"`, 400);
    }

    return trimmed;
  }

  if (Array.isArray(value)) {
    throw new AppError(`La pregunta "${question.text}" no admite multiples valores`, 400);
  }

  const trimmed = value.trim();

  if (question.type === QuestionType.DATE) {
    if (Number.isNaN(Date.parse(trimmed))) {
      throw new AppError(`La pregunta "${question.text}" requiere una fecha valida`, 400);
    }
    return trimmed;
  }

  const maxLength = question.type === QuestionType.SHORT_TEXT ? 300 : 5000;
  if (trimmed.length > maxLength) {
    throw new AppError(`La respuesta a "${question.text}" excede la longitud maxima permitida`, 400);
  }

  return trimmed;
};

export const submitResponse = async (studentId: string, input: SubmitResponseInput) => {
  const form = await prisma.form.findUnique({
    where: { id: input.formId },
    include: {
      questions: { include: { options: true } },
    },
  });

  if (!form) {
    throw new AppError("Formulario no encontrado", 404);
  }

  if (form.status !== FormStatus.ACTIVE) {
    throw new AppError("Este formulario no esta disponible actualmente", 403);
  }

  const existingResponse = await prisma.response.findUnique({
    where: { formId_studentId: { formId: form.id, studentId } },
  });

  if (existingResponse) {
    throw new AppError("Ya enviaste una respuesta para este formulario", 400);
  }

  const formQuestionIds = new Set(form.questions.map((question) => question.id));
  const invalidAnswer = input.answers.find((answer) => !formQuestionIds.has(answer.questionId));

  if (invalidAnswer) {
    throw new AppError(
      "Una de las respuestas hace referencia a una pregunta que no pertenece a este formulario",
      400
    );
  }

  const answersByQuestionId = new Map(input.answers.map((answer) => [answer.questionId, answer.value]));
  const answersToCreate: { questionId: string; value: string }[] = [];

  for (const question of form.questions) {
    const normalizedValue = normalizeAnswerValue(question, answersByQuestionId.get(question.id));

    if (normalizedValue !== null) {
      answersToCreate.push({ questionId: question.id, value: normalizedValue });
    }
  }

  try {
    return await prisma.$transaction(async (tx) => {
      return tx.response.create({
        data: {
          formId: form.id,
          studentId,
          answers: {
            create: answersToCreate,
          },
        },
        include: {
          answers: true,
          form: { select: { id: true, title: true, code: true } },
        },
      });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AppError("Ya enviaste una respuesta para este formulario", 400);
    }
    throw error;
  }
};

export const getMyResponses = async (studentId: string) => {
  const [responses, unreadNotifications] = await Promise.all([
    prisma.response.findMany({
      where: { studentId },
      orderBy: { submittedAt: "desc" },
      include: {
        form: { select: { id: true, title: true, code: true } },
        _count: { select: { comments: true } },
      },
    }),
    prisma.notification.findMany({
      where: { userId: studentId, read: false, responseId: { not: null } },
      select: { responseId: true },
    }),
  ]);

  const unreadResponseIds = new Set(unreadNotifications.map((notification) => notification.responseId));

  return responses.map((response) => ({
    id: response.id,
    status: response.status,
    submittedAt: response.submittedAt,
    form: response.form,
    commentCount: response._count.comments,
    hasUnreadFeedback: unreadResponseIds.has(response.id),
  }));
};

export const getResponsesForForm = async (teacherId: string, formId: string) => {
  const form = await prisma.form.findUnique({ where: { id: formId } });

  if (!form) {
    throw new AppError("Formulario no encontrado", 404);
  }

  if (form.teacherId !== teacherId) {
    throw new AppError("No tienes permiso sobre este formulario", 403);
  }

  const responses = await prisma.response.findMany({
    where: { formId },
    orderBy: { submittedAt: "desc" },
    include: {
      student: { select: { id: true, fullName: true, email: true, documentId: true } },
      _count: { select: { comments: true } },
    },
  });

  return responses.map((response) => ({
    id: response.id,
    status: response.status,
    submittedAt: response.submittedAt,
    student: response.student,
    commentCount: response._count.comments,
  }));
};

export const getResponseDetail = async (
  requester: { id: string; role: Role },
  responseId: string
) => {
  const response = await prisma.response.findUnique({
    where: { id: responseId },
    include: {
      answers: { include: { question: true } },
      form: {
        include: {
          questions: {
            orderBy: { order: "asc" },
            include: { options: { orderBy: { order: "asc" } } },
          },
        },
      },
      student: { select: { id: true, fullName: true, email: true, documentId: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { teacher: { select: { id: true, fullName: true } } },
      },
    },
  });

  if (!response) {
    throw new AppError("Respuesta no encontrada", 404);
  }

  const isOwnerStudent = requester.role === Role.STUDENT && response.studentId === requester.id;
  const isOwnerTeacher = requester.role === Role.TEACHER && response.form.teacherId === requester.id;

  if (!isOwnerStudent && !isOwnerTeacher) {
    throw new AppError("No tienes permiso para consultar esta respuesta", 403);
  }

  // Al abrir su propia respuesta, el estudiante "revisa" la retroalimentacion pendiente:
  // se marcan como leidas las notificaciones asociadas para que desaparezca de "pendientes".
  if (isOwnerStudent) {
    await prisma.notification.updateMany({
      where: { userId: requester.id, responseId: response.id, read: false },
      data: { read: true },
    });
  }

  const groupMembership = isOwnerStudent
    ? await prisma.studentGroupMember.findUnique({
        where: { responseId: response.id },
        select: {
          group: {
            select: {
              name: true,
              assessmentCriteria: {
                orderBy: { order: "asc" },
                include: {
                  grades: {
                    where: { responseId: response.id },
                    select: { scoreTenths: true },
                  },
                },
              },
            },
          },
        },
      })
    : null;

  const criteria = groupMembership?.group.assessmentCriteria.map((criterion) => ({
    id: criterion.id,
    name: criterion.name,
    weight: criterion.weight,
    score: criterion.grades[0] ? criterion.grades[0].scoreTenths / 10 : null,
  })) ?? [];
  const isAssessmentComplete = criteria.length > 0 && criteria.every((criterion) => criterion.score !== null);
  const finalGradeTenths = isAssessmentComplete
    ? calculateWeightedGradeTenths(
        criteria.map(({ id, weight }) => ({ id, weight })),
        new Map(
          criteria.map((criterion) => [
            criterion.id,
            criterion.score === null ? null : Math.round(criterion.score * 10),
          ])
        )
      )
    : null;
  const finalGrade = finalGradeTenths === null ? null : finalGradeTenths / 10;

  return {
    ...response,
    groupAssessment: groupMembership && criteria.length > 0
      ? {
          groupName: groupMembership.group.name,
          criteria,
          finalGrade,
        }
      : null,
  };
};

const RESPONSE_STATUS_LABELS: Record<ResponseStatus, string> = {
  PENDING: "Pendiente de revision",
  REVIEWED: "Revisada",
  NEEDS_CORRECTION: "Requiere correccion",
};

export const updateResponseStatus = async (
  teacherId: string,
  responseId: string,
  status: ResponseStatus
) => {
  const response = await prisma.response.findUnique({
    where: { id: responseId },
    include: { form: true },
  });

  if (!response) {
    throw new AppError("Respuesta no encontrada", 404);
  }

  if (response.form.teacherId !== teacherId) {
    throw new AppError("No tienes permiso sobre esta respuesta", 403);
  }

  if (response.status === status) {
    return response;
  }

  const [updatedResponse] = await prisma.$transaction([
    prisma.response.update({
      where: { id: responseId },
      data: { status },
    }),
    prisma.notification.create({
      data: {
        userId: response.studentId,
        responseId: response.id,
        message: `El estado de tu respuesta al formulario "${response.form.title}" cambio a: ${RESPONSE_STATUS_LABELS[status]}.`,
      },
    }),
  ]);

  return updatedResponse;
};
