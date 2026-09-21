import { FormWithQuestions, Question } from "./form";

export type ResponseStatus = "PENDING" | "REVIEWED" | "NEEDS_CORRECTION";

export interface Answer {
  id: string;
  responseId: string;
  questionId: string;
  value: string;
}

export interface AnswerWithQuestion extends Answer {
  question: Question;
}

export interface ResponseSummary {
  id: string;
  status: ResponseStatus;
  submittedAt: string;
  form: { id: string; title: string; code: string };
  commentCount: number;
  hasUnreadFeedback: boolean;
}

export interface Comment {
  id: string;
  responseId: string;
  teacherId: string;
  text: string;
  createdAt: string;
  teacher: { id: string; fullName: string };
}

export interface TeacherResponseSummary {
  id: string;
  status: ResponseStatus;
  submittedAt: string;
  student: { id: string; fullName: string; email: string; documentId: string };
  commentCount: number;
}

export interface ResponseDetail {
  id: string;
  formId: string;
  studentId: string;
  status: ResponseStatus;
  submittedAt: string;
  answers: AnswerWithQuestion[];
  form: FormWithQuestions;
  student: { id: string; fullName: string; email: string; documentId: string };
  comments: Comment[];
}
