import { prisma } from "../../config/db";
import { AppError } from "../../utils/AppError";
import { CreateCommentInput } from "./comments.schemas";

export const addComment = async (
  teacherId: string,
  responseId: string,
  input: CreateCommentInput
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

  const [comment] = await prisma.$transaction([
    prisma.comment.create({
      data: {
        responseId,
        teacherId,
        text: input.text,
      },
      include: {
        teacher: { select: { id: true, fullName: true } },
      },
    }),
    prisma.notification.create({
      data: {
        userId: response.studentId,
        responseId: response.id,
        message: `El profesor ha realizado un comentario sobre tu formulario "${response.form.title}".`,
      },
    }),
  ]);

  return comment;
};
