import { DragEvent } from "react";
import { GripIcon } from "../icons/Icons";
import { QUESTION_TYPE_OPTIONS, QUESTION_TYPES_WITH_OPTIONS } from "../../utils/questionTypes";
import { Input } from "../ui/Input";
import { BuilderQuestion } from "./formBuilderTypes";

interface QuestionBuilderItemProps {
  question: BuilderQuestion;
  index: number;
  error?: string;
  onChange: (question: BuilderQuestion) => void;
  onRemove: () => void;
  isDragging: boolean;
  onHandleDragStart: (event: DragEvent<HTMLSpanElement>) => void;
  onHandleDragEnd: () => void;
  onCardDragOver: (event: DragEvent<HTMLDivElement>) => void;
}

let optionIdCounter = 0;
const generateOptionLocalId = () => `option-${Date.now()}-${optionIdCounter++}`;

export const QuestionBuilderItem = ({
  question,
  index,
  error,
  onChange,
  onRemove,
  isDragging,
  onHandleDragStart,
  onHandleDragEnd,
  onCardDragOver,
}: QuestionBuilderItemProps) => {
  const needsOptions = QUESTION_TYPES_WITH_OPTIONS.includes(question.type);

  const handleTypeChange = (type: BuilderQuestion["type"]) => {
    const stillNeedsOptions = QUESTION_TYPES_WITH_OPTIONS.includes(type);
    onChange({
      ...question,
      type,
      options: stillNeedsOptions ? question.options : [],
    });
  };

  const handleAddOption = () => {
    onChange({
      ...question,
      options: [...question.options, { localId: generateOptionLocalId(), text: "" }],
    });
  };

  const handleOptionTextChange = (optionLocalId: string, text: string) => {
    onChange({
      ...question,
      options: question.options.map((option) =>
        option.localId === optionLocalId ? { ...option, text } : option
      ),
    });
  };

  const handleRemoveOption = (optionLocalId: string) => {
    onChange({
      ...question,
      options: question.options.filter((option) => option.localId !== optionLocalId),
    });
  };

  return (
    <div
      onDragOver={onCardDragOver}
      className={`space-y-4 rounded-xl border p-4 transition-all duration-200 ${
        isDragging
          ? "border-brand-400 bg-brand-50/60 opacity-50 shadow-lg"
          : "border-neutral-200 bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium text-neutral-500">
          <span
            draggable
            onDragStart={onHandleDragStart}
            onDragEnd={onHandleDragEnd}
            title="Arrastra para reordenar"
            className="cursor-grab rounded p-0.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-brand-600 active:cursor-grabbing"
          >
            <GripIcon className="h-4 w-4" />
          </span>
          Pregunta {index + 1}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="text-sm font-medium text-red-600 hover:text-red-700"
        >
          Eliminar
        </button>
      </div>

      <Input
        label="Texto de la pregunta"
        name={`question-${question.localId}-text`}
        value={question.text}
        onChange={(event) => onChange({ ...question, text: event.target.value })}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-neutral-700">Tipo de pregunta</label>
          <select
            className="rounded-lg border-2 border-neutral-200 hover:border-neutral-300 px-3 py-2.5 text-sm text-neutral-900 outline-none transition-all duration-200 focus:scale-[1.01] focus:border-transparent focus:ring-4 focus:ring-emerald-500/30"
            value={question.type}
            onChange={(event) => handleTypeChange(event.target.value as BuilderQuestion["type"])}
          >
            {QUESTION_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 self-end pb-2.5 text-sm font-medium text-neutral-700">
          <input
            type="checkbox"
            checked={question.required}
            onChange={(event) => onChange({ ...question, required: event.target.checked })}
            className="h-4 w-4 rounded text-brand-600 focus:ring-emerald-500"
          />
          Pregunta obligatoria
        </label>
      </div>

      {needsOptions && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-neutral-700">Opciones</p>
          {question.options.map((option, optionIndex) => (
            <div key={option.localId} className="flex items-center gap-2">
              <input
                type="text"
                value={option.text}
                onChange={(event) => handleOptionTextChange(option.localId, event.target.value)}
                placeholder={`Opcion ${optionIndex + 1}`}
                className="flex-1 rounded-lg border-2 border-neutral-200 hover:border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none transition-all duration-200 focus:scale-[1.01] focus:border-transparent focus:ring-4 focus:ring-emerald-500/30"
              />
              <button
                type="button"
                onClick={() => handleRemoveOption(option.localId)}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                Quitar
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddOption}
            className="text-sm font-medium text-brand-700 hover:text-brand-800"
          >
            + Agregar opcion
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};
