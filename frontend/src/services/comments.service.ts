import { api } from "../lib/api";
import { Comment } from "../types/response";

export const addComment = async (responseId: string, text: string): Promise<Comment> => {
  const { data } = await api.post<{ comment: Comment }>(`/responses/${responseId}/comments`, {
    text,
  });
  return data.comment;
};
