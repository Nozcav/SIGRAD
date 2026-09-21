import { QuestionType } from "../types/form";

export const QUESTION_TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: "SHORT_TEXT", label: "Respuesta corta" },
  { value: "LONG_TEXT", label: "Respuesta larga" },
  { value: "SINGLE_CHOICE", label: "Seleccion unica" },
  { value: "MULTIPLE_CHOICE", label: "Seleccion multiple" },
  { value: "DROPDOWN", label: "Lista desplegable" },
  { value: "DATE", label: "Fecha" },
];

export const QUESTION_TYPES_WITH_OPTIONS: QuestionType[] = [
  "SINGLE_CHOICE",
  "MULTIPLE_CHOICE",
  "DROPDOWN",
];
