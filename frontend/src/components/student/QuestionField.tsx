import { ChangeEvent } from "react";
import { Question } from "../../types/form";

interface QuestionFieldProps {
  question: Question;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
  error?: string;
}

const baseInputClasses =
  "w-full rounded-lg border px-3 py-2.5 text-sm text-neutral-900 outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-emerald-500";

export const QuestionField = ({ question, value, onChange, error }: QuestionFieldProps) => {
  const borderClass = error ? "border-red-400" : "border-neutral-300";

  const renderInput = () => {
    switch (question.type) {
      case "SHORT_TEXT":
        return (
          <input
            type="text"
            className={`${baseInputClasses} ${borderClass}`}
            value={typeof value === "string" ? value : ""}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
            maxLength={300}
          />
        );

      case "LONG_TEXT":
        return (
          <textarea
            className={`${baseInputClasses} ${borderClass} min-h-[120px] resize-y`}
            value={typeof value === "string" ? value : ""}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)}
            maxLength={5000}
          />
        );

      case "DATE":
        return (
          <input
            type="date"
            className={`${baseInputClasses} ${borderClass}`}
            value={typeof value === "string" ? value : ""}
            onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
          />
        );

      case "DROPDOWN":
        return (
          <select
            className={`${baseInputClasses} ${borderClass} bg-white`}
            value={typeof value === "string" ? value : ""}
            onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value)}
          >
            <option value="" disabled>
              Selecciona una opcion
            </option>
            {question.options.map((option) => (
              <option key={option.id} value={option.text}>
                {option.text}
              </option>
            ))}
          </select>
        );

      case "SINGLE_CHOICE":
        return (
          <div className="flex flex-col gap-2">
            {question.options.map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option.text}
                  checked={value === option.text}
                  onChange={() => onChange(option.text)}
                  className="h-4 w-4 text-brand-600 focus:ring-emerald-500"
                />
                {option.text}
              </label>
            ))}
          </div>
        );

      case "MULTIPLE_CHOICE": {
        const selectedValues = Array.isArray(value) ? value : [];

        const toggleOption = (optionText: string) => {
          if (selectedValues.includes(optionText)) {
            onChange(selectedValues.filter((item) => item !== optionText));
          } else {
            onChange([...selectedValues, optionText]);
          }
        };

        return (
          <div className="flex flex-col gap-2">
            {question.options.map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <input
                  type="checkbox"
                  value={option.text}
                  checked={selectedValues.includes(option.text)}
                  onChange={() => toggleOption(option.text)}
                  className="h-4 w-4 rounded text-brand-600 focus:ring-emerald-500"
                />
                {option.text}
              </label>
            ))}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-neutral-800">
        {question.text}
        {question.required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {renderInput()}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};
