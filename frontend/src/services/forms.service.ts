import { api } from "../lib/api";
import {
  CreateFormPayload,
  FormDetailForTeacher,
  FormListItem,
  FormStatus,
  FormWithQuestions,
  UpdateFormPayload,
} from "../types/form";
import { TeacherResponseSummary } from "../types/response";

// --- Acceso de estudiante por codigo ---

export const getFormByCode = async (code: string): Promise<FormWithQuestions> => {
  const { data } = await api.get<{ form: FormWithQuestions }>(
    `/forms/code/${encodeURIComponent(code)}`
  );
  return data.form;
};

// --- CRUD de formularios para el docente propietario ---

export const createForm = async (payload: CreateFormPayload): Promise<FormWithQuestions> => {
  const { data } = await api.post<{ form: FormWithQuestions }>("/forms", payload);
  return data.form;
};

export const listMyForms = async (): Promise<FormListItem[]> => {
  const { data } = await api.get<{ forms: FormListItem[] }>("/forms");
  return data.forms;
};

export const getFormForTeacher = async (id: string): Promise<FormDetailForTeacher> => {
  const { data } = await api.get<{ form: FormDetailForTeacher }>(`/forms/${id}`);
  return data.form;
};

export const updateForm = async (
  id: string,
  payload: UpdateFormPayload
): Promise<FormWithQuestions> => {
  const { data } = await api.patch<{ form: FormWithQuestions }>(`/forms/${id}`, payload);
  return data.form;
};

export const archiveForm = async (id: string): Promise<void> => {
  await api.delete(`/forms/${id}`);
};

export const updateFormStatus = async (id: string, status: FormStatus): Promise<void> => {
  await api.patch(`/forms/${id}/status`, { status });
};

export const getResponsesForForm = async (formId: string): Promise<TeacherResponseSummary[]> => {
  const { data } = await api.get<{ responses: TeacherResponseSummary[] }>(
    `/forms/${formId}/responses`
  );
  return data.responses;
};
