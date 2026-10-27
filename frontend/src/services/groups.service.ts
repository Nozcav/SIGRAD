import { api } from "../lib/api";
import {
  GroupAssessmentCriterionInput,
  GroupAssessmentGradeInput,
  StudentGroup,
  StudentGroupPayload,
} from "../types/group";

export const getGroupsForForm = async (formId: string): Promise<StudentGroup[]> => {
  const { data } = await api.get<{ groups: StudentGroup[] }>(`/groups/forms/${formId}`);
  return data.groups;
};

export const createGroup = async (formId: string, payload: StudentGroupPayload): Promise<void> => {
  await api.post(`/groups/forms/${formId}`, payload);
};

export const updateGroup = async (groupId: string, payload: StudentGroupPayload): Promise<void> => {
  await api.patch(`/groups/${groupId}`, payload);
};

export const deleteGroup = async (groupId: string): Promise<void> => {
  await api.delete(`/groups/${groupId}`);
};

export const saveGroupAssessment = async (
  groupId: string,
  criteria: GroupAssessmentCriterionInput[]
): Promise<void> => {
  await api.put(`/groups/${groupId}/assessment`, { criteria });
};

export const saveGroupGrades = async (
  groupId: string,
  grades: GroupAssessmentGradeInput[]
): Promise<void> => {
  await api.put(`/groups/${groupId}/grades`, { grades });
};