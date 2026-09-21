export type QuestionType =
  | "SHORT_TEXT"
  | "LONG_TEXT"
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "DROPDOWN"
  | "DATE";

export type FormStatus = "ACTIVE" | "CLOSED" | "ARCHIVED";

export interface QuestionOption {
  id: string;
  questionId: string;
  text: string;
  order: number;
}

export interface Question {
  id: string;
  formId: string;
  text: string;
  type: QuestionType;
  required: boolean;
  order: number;
  options: QuestionOption[];
}

export interface FormWithQuestions {
  id: string;
  title: string;
  description: string | null;
  code: string;
  status: FormStatus;
  teacherId: string;
  createdAt: string;
  updatedAt: string;
  questions: Question[];
}

export interface FormDetailForTeacher extends FormWithQuestions {
  _count: { responses: number };
}

export interface FormListItem {
  id: string;
  title: string;
  description: string | null;
  code: string;
  status: FormStatus;
  createdAt: string;
  updatedAt: string;
  responseCount: number;
}

export interface QuestionOptionInput {
  text: string;
}

export interface QuestionInput {
  text: string;
  type: QuestionType;
  required: boolean;
  options?: QuestionOptionInput[];
}

export interface CreateFormPayload {
  title: string;
  description?: string;
  questions: QuestionInput[];
}

export interface UpdateFormPayload {
  title?: string;
  description?: string;
  questions?: QuestionInput[];
}
