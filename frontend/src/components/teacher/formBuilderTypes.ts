import { Question, QuestionType } from "../../types/form";

export interface BuilderOption {
  localId: string;
  text: string;
}

export interface BuilderQuestion {
  localId: string;
  text: string;
  type: QuestionType;
  required: boolean;
  options: BuilderOption[];
}

// Reutiliza los ids reales de la base de datos como localId: son unicos y
// estables, asi que sirven directamente como key/identificador en el builder.
export const toBuilderQuestions = (questions: Question[]): BuilderQuestion[] =>
  questions.map((question) => ({
    localId: question.id,
    text: question.text,
    type: question.type,
    required: question.required,
    options: question.options.map((option) => ({ localId: option.id, text: option.text })),
  }));
