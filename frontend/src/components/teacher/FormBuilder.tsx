import { DragEvent, FormEvent, useState } from "react";
import { QuestionInput } from "../../types/form";
import { QUESTION_TYPES_WITH_OPTIONS } from "../../utils/questionTypes";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { BuilderQuestion } from "./formBuilderTypes";
import { QuestionBuilderItem } from "./QuestionBuilderItem";

let questionIdCounter = 0;
const generateQuestionLocalId = () => `question-${Date.now()}-${questionIdCounter++}`;

const createEmptyQuestion = (): BuilderQuestion => ({
  localId: generateQuestionLocalId(),
  text: "",
  type: "SHORT_TEXT",
  required: true,
  options: [],
});

export interface FormBuilderSubmitPayload {
  title: string;
  description?: string;
  questions?: QuestionInput[];
}

interface FormBuilderProps {
  initialTitle?: string;
  initialDescription?: string;
  initialQuestions?: BuilderQuestion[];
  questionsLocked?: boolean;
  isSubmitting: boolean;
  submitLabel: string;
  serverError?: string | null;
  onSubmit: (payload: FormBuilderSubmitPayload) => void;
}

export const FormBuilder = ({
  initialTitle = "",
  initialDescription = "",
  initialQuestions,
  questionsLocked = false,
  isSubmitting,
  submitLabel,
  serverError,
  onSubmit,
}: FormBuilderProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [questions, setQuestions] = useState<BuilderQuestion[]>(
    initialQuestions && initialQuestions.length > 0 ? initialQuestions : [createEmptyQuestion()]
  );

  const [titleError, setTitleError] = useState<string | null>(null);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [questionErrors, setQuestionErrors] = useState<Record<string, string>>({});
  const [draggedLocalId, setDraggedLocalId] = useState<string | null>(null);

  const handleQuestionChange = (updated: BuilderQuestion) => {
    setQuestions((previous) =>
      previous.map((question) => (question.localId === updated.localId ? updated : question))
    );
    setQuestionErrors((previous) => {
      if (!previous[updated.localId]) {
        return previous;
      }
      const next = { ...previous };
      delete next[updated.localId];
      return next;
    });
  };

  const handleAddQuestion = () => {
    setQuestions((previous) => [...previous, createEmptyQuestion()]);
  };

  const handleRemoveQuestion = (localId: string) => {
    setQuestions((previous) => previous.filter((question) => question.localId !== localId));
  };

  const handleHandleDragStart = (localId: string) => (event: DragEvent<HTMLSpanElement>) => {
    setDraggedLocalId(localId);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleHandleDragEnd = () => {
    setDraggedLocalId(null);
  };

  const handleCardDragOver = (targetLocalId: string) => (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (!draggedLocalId || draggedLocalId === targetLocalId) {
      return;
    }

    setQuestions((previous) => {
      const draggedIndex = previous.findIndex((question) => question.localId === draggedLocalId);
      const targetIndex = previous.findIndex((question) => question.localId === targetLocalId);

      if (draggedIndex === -1 || targetIndex === -1) {
        return previous;
      }

      const reordered = [...previous];
      const [draggedQuestion] = reordered.splice(draggedIndex, 1);
      reordered.splice(targetIndex, 0, draggedQuestion);
      return reordered;
    });
  };

  const validate = (): boolean => {
    let isValid = true;
    setTitleError(null);
    setQuestionsError(null);
    setQuestionErrors({});

    if (title.trim().length < 3) {
      setTitleError("El titulo debe tener al menos 3 caracteres");
      isValid = false;
    }

    if (questionsLocked) {
      return isValid;
    }

    if (questions.length === 0) {
      setQuestionsError("El formulario debe tener al menos una pregunta");
      return false;
    }

    const nextQuestionErrors: Record<string, string> = {};

    for (const question of questions) {
      if (question.text.trim().length === 0) {
        nextQuestionErrors[question.localId] = "El texto de la pregunta es requerido";
        continue;
      }

      const needsOptions = QUESTION_TYPES_WITH_OPTIONS.includes(question.type);
      const nonEmptyOptions = question.options.filter((option) => option.text.trim().length > 0);

      if (needsOptions && nonEmptyOptions.length < 2) {
        nextQuestionErrors[question.localId] =
          "Este tipo de pregunta requiere al menos 2 opciones con texto";
      }
    }

    if (Object.keys(nextQuestionErrors).length > 0) {
      setQuestionErrors(nextQuestionErrors);
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const payload: FormBuilderSubmitPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
    };

    if (!questionsLocked) {
      payload.questions = questions.map((question) => ({
        text: question.text.trim(),
        type: question.type,
        required: question.required,
        options: QUESTION_TYPES_WITH_OPTIONS.includes(question.type)
          ? question.options
              .filter((option) => option.text.trim().length > 0)
              .map((option) => ({ text: option.text.trim() }))
          : undefined,
      }));
    }

    onSubmit(payload);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit} noValidate>
      {serverError && <Alert message={serverError} />}

      <div className="space-y-5 rounded-2xl border border-white/60 bg-white/70 backdrop-blur-xl p-6">
        <Input
          label="Titulo del formulario"
          name="title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          error={titleError ?? undefined}
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700" htmlFor="description">
            Descripcion (opcional)
          </label>
          <textarea
            id="description"
            className="min-h-[90px] resize-y rounded-lg border-2 border-neutral-200 hover:border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 outline-none transition-all duration-200 focus:scale-[1.01] focus:border-transparent focus:ring-4 focus:ring-emerald-500/30"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
      </div>

      {questionsLocked && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Este formulario ya tiene respuestas registradas. Para proteger la integridad de los
          datos, no es posible modificar sus preguntas. Si necesitas cambios, cierra o archiva
          este formulario y crea uno nuevo.
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">Preguntas</h2>
          {!questionsLocked && (
            <button
              type="button"
              onClick={handleAddQuestion}
              className="text-sm font-medium text-brand-700 hover:text-brand-800"
            >
              + Agregar pregunta
            </button>
          )}
        </div>

        {questionsError && <p className="text-sm text-red-600">{questionsError}</p>}

        {questionsLocked ? (
          <div className="space-y-3">
            {questions.map((question, index) => (
              <div
                key={question.localId}
                className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 opacity-75"
              >
                <p className="text-sm font-medium text-neutral-500">Pregunta {index + 1}</p>
                <p className="mt-1 text-sm text-neutral-800">
                  {question.text} {question.required && <span className="text-red-500">*</span>}
                </p>
                {question.options.length > 0 && (
                  <ul className="mt-2 list-inside list-disc text-sm text-neutral-500">
                    {question.options.map((option) => (
                      <li key={option.localId}>{option.text}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {questions.length > 1 && (
              <p className="text-xs text-neutral-500">
                Arrastra el icono ⠿ para cambiar el orden de las preguntas.
              </p>
            )}
            {questions.map((question, index) => (
              <QuestionBuilderItem
                key={question.localId}
                question={question}
                index={index}
                error={questionErrors[question.localId]}
                onChange={handleQuestionChange}
                onRemove={() => handleRemoveQuestion(question.localId)}
                isDragging={draggedLocalId === question.localId}
                onHandleDragStart={handleHandleDragStart(question.localId)}
                onHandleDragEnd={handleHandleDragEnd}
                onCardDragOver={handleCardDragOver(question.localId)}
              />
            ))}
          </div>
        )}
      </div>

      <Button type="submit" isLoading={isSubmitting}>
        {submitLabel}
      </Button>
    </form>
  );
};
