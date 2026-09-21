import { api } from "../lib/api";
import { ResponseDetail, ResponseStatus, ResponseSummary } from "../types/response";

export interface SubmitAnswerInput {
  questionId: string;
  value: string | string[];
}

export interface SubmitResponsePayload {
  formId: string;
  answers: SubmitAnswerInput[];
}

export interface SubmittedResponse {
  id: string;
}

export const submitResponse = async (
  payload: SubmitResponsePayload
): Promise<SubmittedResponse> => {
  const { data } = await api.post<{ response: SubmittedResponse }>("/responses", payload);
  return data.response;
};

export const getMyResponses = async (): Promise<ResponseSummary[]> => {
  const { data } = await api.get<{ responses: ResponseSummary[] }>("/responses/my-responses");
  return data.responses;
};

export const getResponseDetail = async (id: string): Promise<ResponseDetail> => {
  const { data } = await api.get<{ response: ResponseDetail }>(`/responses/${id}`);
  return data.response;
};

// El backend devuelve formas distintas segun si el estado cambio o no,
// asi que el llamador actualiza su estado local con el valor que envio.
export const updateResponseStatus = async (
  responseId: string,
  status: ResponseStatus
): Promise<void> => {
  await api.patch(`/responses/${responseId}/status`, { status });
};
