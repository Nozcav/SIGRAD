import { prisma } from "../../config/db";
import { AppError } from "../../utils/AppError";
import { calculateWeightedGradeTenths } from "../../utils/weightedGrade";
import { SaveAssessmentInput, SaveGradesInput } from "./groups.schemas";

const assertFormOwnership = async (teacherId: string, formId: string) => {
  const form = await prisma.form.findUnique({ where: { id: formId }, select: { id: true, teacherId: true } });
  if (!form) throw new AppError("Formulario no encontrado", 404);
  if (form.teacherId !== teacherId) throw new AppError("No tienes permiso sobre este formulario", 403);
  return form;
};

const validateResponses = async (formId: string, responseIds: string[], excludingGroupId?: string) => {
  const responses = await prisma.response.findMany({
    where: { id: { in: responseIds }, formId },
    select: { id: true },
  });
  if (responses.length !== responseIds.length) {
    throw new AppError("Todos los estudiantes deben tener una respuesta enviada para este formulario", 400);
  }

  const assigned = await prisma.studentGroupMember.findMany({
    where: { responseId: { in: responseIds }, ...(excludingGroupId ? { groupId: { not: excludingGroupId } } : {}) },
    select: { responseId: true },
  });
  if (assigned.length) {
    throw new AppError("Uno o más estudiantes ya pertenecen a otro grupo de este formulario", 409);
  }
};

export const listGroups = async (teacherId: string, formId: string) => {
  await assertFormOwnership(teacherId, formId);

  const [form, groups] = await Promise.all([
    prisma.form.findUniqueOrThrow({
      where: { id: formId },
      select: { questions: { orderBy: { order: "asc" }, include: { options: { orderBy: { order: "asc" } } } } },
    }),
    prisma.studentGroup.findMany({
      where: { formId },
      orderBy: { createdAt: "asc" },
      include: {
        members: {
          orderBy: { createdAt: "asc" },
          include: {
            response: {
              select: {
                id: true,
                student: { select: { id: true, fullName: true, email: true, documentId: true } },
                answers: { select: { questionId: true, value: true } },
              },
            },
          },
        },
        assessmentCriteria: {
          orderBy: { order: "asc" },
          include: { grades: { select: { responseId: true, scoreTenths: true } } },
        },
      },
    }),
  ]);

  return groups.map((group) => {
    const totalMembers = group.members.length;
    const questionEvaluations = form.questions.map((question) => {
      const answers = group.members.flatMap((member) =>
        member.response.answers
          .filter((answer) => answer.questionId === question.id)
          .map((answer) => answer.value)
      );
      const counts = new Map<string, number>();
      for (const value of answers) {
        if (question.type === "MULTIPLE_CHOICE") {
          try {
            const parsed: unknown = JSON.parse(value);
            for (const choice of Array.isArray(parsed) ? parsed : [value]) {
              if (typeof choice === "string") counts.set(choice, (counts.get(choice) ?? 0) + 1);
            }
          } catch {
            counts.set(value, (counts.get(value) ?? 0) + 1);
          }
        } else {
          counts.set(value, (counts.get(value) ?? 0) + 1);
        }
      }

      const labels = question.options.length > 0
        ? question.options.map((option) => option.text)
        : Array.from(counts.keys()).sort((a, b) => a.localeCompare(b, "es"));

      return {
        questionId: question.id,
        text: question.text,
        type: question.type,
        totalMembers,
        answeredCount: answers.length,
        results: labels.map((label) => {
          const count = counts.get(label) ?? 0;
          return { label, count, percentage: totalMembers ? Math.round((count / totalMembers) * 1000) / 10 : 0 };
        }),
      };
    });

    return {
      id: group.id,
      name: group.name,
      formId: group.formId,
      createdAt: group.createdAt,
      members: group.members.map(({ response }) => ({ responseId: response.id, student: response.student })),
      assessment: group.assessmentCriteria.length
        ? {
            criteria: group.assessmentCriteria.map(({ grades, ...criterion }) => ({
              ...criterion,
              grades: grades.map(({ responseId, scoreTenths }) => ({
                responseId,
                score: scoreTenths / 10,
              })),
            })),
          }
        : null,
      evaluations: questionEvaluations,
    };
  });
};

export const createGroup = async (
  teacherId: string,
  formId: string,
  input: { name: string; responseIds: string[] }
) => {
  await assertFormOwnership(teacherId, formId);
  await validateResponses(formId, input.responseIds);
  return prisma.studentGroup.create({
    data: {
      name: input.name,
      formId,
      teacherId,
      members: { create: input.responseIds.map((responseId) => ({ responseId })) },
    },
    select: { id: true, name: true, formId: true },
  });
};

export const updateGroup = async (
  teacherId: string,
  groupId: string,
  input: { name: string; responseIds: string[] }
) => {
  const group = await prisma.studentGroup.findUnique({
    where: { id: groupId },
    select: {
      id: true,
      formId: true,
      teacherId: true,
      members: { select: { responseId: true } },
      assessmentCriteria: {
        select: { grades: { select: { id: true }, take: 1 } },
      },
    },
  });
  if (!group) throw new AppError("Grupo no encontrado", 404);
  if (group.teacherId !== teacherId) throw new AppError("No tienes permiso sobre este grupo", 403);
  const membershipChanged =
    group.members.length !== input.responseIds.length ||
    group.members.some(({ responseId }) => !input.responseIds.includes(responseId));
  if (membershipChanged && group.assessmentCriteria.some(({ grades }) => grades.length > 0)) {
    throw new AppError("No puedes cambiar los integrantes después de registrar calificaciones.", 400);
  }
  await validateResponses(group.formId, input.responseIds, group.id);

  return prisma.$transaction(async (tx) => {
    await tx.studentGroupMember.deleteMany({ where: { groupId } });
    return tx.studentGroup.update({
      where: { id: groupId },
      data: {
        name: input.name,
        members: { create: input.responseIds.map((responseId) => ({ responseId })) },
      },
      select: { id: true, name: true, formId: true },
    });
  });
};

export const deleteGroup = async (teacherId: string, groupId: string) => {
  const group = await prisma.studentGroup.findUnique({
    where: { id: groupId },
    select: {
      teacherId: true,
      assessmentCriteria: {
        select: { grades: { select: { id: true }, take: 1 } },
      },
    },
  });
  if (!group) throw new AppError("Grupo no encontrado", 404);
  if (group.teacherId !== teacherId) throw new AppError("No tienes permiso sobre este grupo", 403);
  if (group.assessmentCriteria.some(({ grades }) => grades.length > 0)) {
    throw new AppError("No se puede eliminar un grupo que ya tiene calificaciones registradas.", 400);
  }
  await prisma.studentGroup.delete({ where: { id: groupId } });
};

export const saveAssessment = async (
  teacherId: string,
  groupId: string,
  input: SaveAssessmentInput
) => {
  const group = await prisma.studentGroup.findUnique({
    where: { id: groupId },
    select: { id: true, teacherId: true },
  });
  if (!group) throw new AppError("Grupo no encontrado", 404);
  if (group.teacherId !== teacherId) throw new AppError("No tienes permiso sobre este grupo", 403);

  const existingCriteria = await prisma.groupAssessmentCriterion.findMany({
    where: { groupId },
    select: { grades: { select: { id: true }, take: 1 } },
  });
  if (existingCriteria.some(({ grades }) => grades.length > 0)) {
    throw new AppError("No puedes modificar la rúbrica después de registrar calificaciones.", 400);
  }

  return prisma.$transaction(async (tx) => {
    await tx.groupAssessmentCriterion.deleteMany({ where: { groupId } });
    await tx.groupAssessmentCriterion.createMany({
      data: input.criteria.map((criterion, order) => ({
        groupId,
        name: criterion.name,
        weight: criterion.weight,
        order,
      })),
    });
    return tx.groupAssessmentCriterion.findMany({
      where: { groupId },
      orderBy: { order: "asc" },
      include: { grades: { select: { responseId: true, scoreTenths: true } } },
    });
  });
};

export const saveGroupGrades = async (
  teacherId: string,
  groupId: string,
  input: SaveGradesInput
) => {
  const group = await prisma.studentGroup.findUnique({
    where: { id: groupId },
    select: {
      id: true,
      teacherId: true,
      name: true,
      members: { select: { responseId: true } },
      assessmentCriteria: { select: { id: true, weight: true } },
    },
  });
  if (!group) throw new AppError("Grupo no encontrado", 404);
  if (group.teacherId !== teacherId) throw new AppError("No tienes permiso sobre este grupo", 403);
  if (group.assessmentCriteria.length === 0) {
    throw new AppError("Primero debes configurar la rúbrica de evaluación.", 400);
  }

  const expectedPairs = new Set(
    group.assessmentCriteria.flatMap((criterion) =>
      group.members.map((member) => `${criterion.id}:${member.responseId}`)
    )
  );
  const receivedPairs = new Set(input.grades.map(({ criterionId, responseId }) => `${criterionId}:${responseId}`));
  if (
    expectedPairs.size !== receivedPairs.size ||
    Array.from(receivedPairs).some((pair) => !expectedPairs.has(pair))
  ) {
    throw new AppError("La lista de calificaciones no coincide con los criterios e integrantes del grupo.", 400);
  }

  return prisma.$transaction(async (tx) => {
    const existingGrades = await tx.groupCriterionGrade.findMany({
      where: { criterion: { groupId } },
      select: { criterionId: true, responseId: true, scoreTenths: true },
    });
    const existingScores = new Map(
      existingGrades.map((grade) => [`${grade.criterionId}:${grade.responseId}`, grade.scoreTenths])
    );
    const nextScores = new Map(
      input.grades.map((grade) => [
        `${grade.criterionId}:${grade.responseId}`,
        grade.score === null ? null : Math.round(grade.score * 10),
      ])
    );

    const changedGradeNotifications = group.members.flatMap((member) => {
      const previousComplete = group.assessmentCriteria.every((criterion) =>
        existingScores.has(`${criterion.id}:${member.responseId}`)
      );
      const nextComplete = group.assessmentCriteria.every(
        (criterion) => nextScores.get(`${criterion.id}:${member.responseId}`) !== null
      );
      const hasChangedGrades = group.assessmentCriteria.some((criterion) => {
        const key = `${criterion.id}:${member.responseId}`;
        return (existingScores.get(key) ?? null) !== (nextScores.get(key) ?? null);
      });
      if (!hasChangedGrades || (!nextComplete && !previousComplete)) return [];

        const getMemberScores = (scores: Map<string, number | null>) =>
          new Map(
            group.assessmentCriteria.map((criterion) => [
              criterion.id,
              scores.get(`${criterion.id}:${member.responseId}`) ?? null,
            ])
          );

        if (!nextComplete) {
          return [{
            responseId: member.responseId,
            message: `El docente actualizó tus criterios de calificación del grupo "${group.name}". Tu nota final está en revisión.`,
          }];
        }

        const nextFinalTenths = calculateWeightedGradeTenths(
          group.assessmentCriteria,
          getMemberScores(nextScores)
        );
        if (nextFinalTenths === null) {
          throw new AppError("No se pudo calcular la nota final del estudiante.", 500);
        }

        const finalGrade = (nextFinalTenths / 10).toFixed(1).replace(".", ",");
        return [{
          responseId: member.responseId,
          message: `El docente actualizó tu calificación del grupo "${group.name}". Tu nota final es ${finalGrade}/5,0.`,
        }];
    });

    await tx.groupCriterionGrade.deleteMany({
      where: { criterion: { groupId } },
    });
    const gradesToCreate = input.grades
      .filter((grade): grade is typeof grade & { score: number } => grade.score !== null)
      .map((grade) => ({
        criterionId: grade.criterionId,
        responseId: grade.responseId,
        scoreTenths: Math.round(grade.score * 10),
      }));
    if (gradesToCreate.length > 0) {
      await tx.groupCriterionGrade.createMany({ data: gradesToCreate });
    }

    if (changedGradeNotifications.length > 0) {
      const responseIds = changedGradeNotifications.map(({ responseId }) => responseId);
      const responses = await tx.response.findMany({
        where: { id: { in: responseIds } },
        select: { id: true, studentId: true },
      });
      const studentIdsByResponse = new Map(responses.map(({ id, studentId }) => [id, studentId]));
      await tx.notification.createMany({
        data: changedGradeNotifications.map(({ responseId, message }) => {
          const studentId = studentIdsByResponse.get(responseId);
          if (!studentId) {
            throw new AppError("No se pudo encontrar al estudiante calificado.", 404);
          }
          return {
            userId: studentId,
            responseId,
            message,
          };
        }),
      });
    }
  });
};