import { FormEvent, useEffect, useMemo, useState } from "react";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { getApiErrorMessage } from "../../lib/api";
import { saveGroupAssessment, saveGroupGrades } from "../../services/groups.service";
import {
  GroupAssessmentCriterionInput,
  GroupAssessmentGradeInput,
  GroupAssessmentCriterion,
  StudentGroup,
} from "../../types/group";

interface GroupAssessmentProps {
  group: StudentGroup;
  onUpdated: () => Promise<void>;
}

interface CriterionDraft extends GroupAssessmentCriterionInput {
  key: string;
}

const EMPTY_CRITERIA: GroupAssessmentCriterion[] = [];
const getScoreKey = (responseId: string, criterionId: string) => `${responseId}:${criterionId}`;
const hasScoreValue = (value: string | undefined) => value !== undefined && value.trim() !== "";

const formatGrade = (grade: number) =>
  new Intl.NumberFormat("es-CO", { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(grade);

const GroupAssessment = ({ group, onUpdated }: GroupAssessmentProps) => {
  const [isConfiguring, setIsConfiguring] = useState(!group.assessment);
  const [criteriaDraft, setCriteriaDraft] = useState<CriterionDraft[]>([]);
  const [scores, setScores] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const criteria = group.assessment?.criteria ?? EMPTY_CRITERIA;
  const gradeMap = useMemo(() => {
    const grades = new Map<string, number>();
    for (const criterion of criteria) {
      for (const grade of criterion.grades) {
        grades.set(getScoreKey(grade.responseId, criterion.id), grade.score);
      }
    }
    return grades;
  }, [criteria]);

  useEffect(() => {
    setCriteriaDraft(
      criteria.map((criterion) => ({
        key: criterion.id,
        name: criterion.name,
        weight: criterion.weight,
      }))
    );
    setScores(
      Object.fromEntries(
        criteria.flatMap((criterion) =>
          group.members.map((member) => {
            const score = gradeMap.get(getScoreKey(member.responseId, criterion.id));
            return [getScoreKey(member.responseId, criterion.id), score === undefined ? "" : String(score)];
          })
        )
      )
    );
  }, [group.id, group.members, criteria, gradeMap]);

  const totalWeight = criteriaDraft.reduce((total, criterion) => total + criterion.weight, 0);
  const hasSavedGrades = criteria.some((criterion) => criterion.grades.length > 0);
  const scoreCells = criteria.flatMap((criterion) =>
    group.members.map((member) => ({
      criterionId: criterion.id,
      responseId: member.responseId,
      key: getScoreKey(member.responseId, criterion.id),
    }))
  );
  const completedScores = scoreCells.filter(({ key }) => hasScoreValue(scores[key])).length;
  const isComplete = scoreCells.length > 0 && completedScores === scoreCells.length;
  const hasScoreChanges = scoreCells.some(({ key }) => {
    const savedScore = gradeMap.get(key);
    return (scores[key] ?? "") !== (savedScore === undefined ? "" : String(savedScore));
  });
  const scoresAreValid = scoreCells.every(({ key }) => {
    if (!hasScoreValue(scores[key])) return true;
    const score = Number(scores[key]);
    return score >= 0 && score <= 5 && Math.abs(score * 10 - Math.round(score * 10)) < 1e-8;
  });

  const updateCriterion = (key: string, patch: Partial<GroupAssessmentCriterionInput>) => {
    setCriteriaDraft((previous) =>
      previous.map((criterion) => (criterion.key === key ? { ...criterion, ...patch } : criterion))
    );
  };

  const handleSaveRubric = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await saveGroupAssessment(
        group.id,
        criteriaDraft.map(({ name, weight }) => ({ name: name.trim(), weight }))
      );
      setIsConfiguring(false);
      await onUpdated();
    } catch (saveError) {
      setError(getApiErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveGrades = async () => {
    setError(null);
    setIsSaving(true);
    try {
      const grades: GroupAssessmentGradeInput[] = scoreCells.map(({ criterionId, responseId, key }) => ({
        criterionId,
        responseId,
        score: hasScoreValue(scores[key]) ? Number(scores[key]) : null,
      }));
      await saveGroupGrades(group.id, grades);
      await onUpdated();
    } catch (saveError) {
      setError(getApiErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 border-t border-neutral-100 pt-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-neutral-900">Calificación del grupo</h3>
          <p className="mt-1 text-xs text-neutral-500">
            Define criterios con porcentajes y califica a cada integrante de 0,0 a 5,0.
          </p>
        </div>
        {criteria.length > 0 && !isConfiguring && (
          <Button
            type="button"
            className="w-auto bg-neutral-100 text-neutral-700 shadow-none ring-0 hover:bg-neutral-200 hover:shadow-none"
            disabled={hasSavedGrades}
            title={hasSavedGrades ? "La rúbrica no se puede cambiar después de empezar a calificar." : undefined}
            onClick={() => {
              setError(null);
              setIsConfiguring(true);
            }}
          >
            Editar criterios
          </Button>
        )}
      </div>

      {error && <Alert message={error} />}

      {isConfiguring ? (
        <form onSubmit={handleSaveRubric} className="space-y-4 rounded-xl bg-neutral-50 p-4">
          <div>
            <h4 className="font-medium text-neutral-900">Criterios y ponderación</h4>
            <p className="mt-1 text-sm text-neutral-600">
              Agrega aspectos como vestimenta, presentación o trabajo en equipo. Los porcentajes deben sumar exactamente 100%.
            </p>
          </div>

          <div className="space-y-3">
            {criteriaDraft.map((criterion, index) => (
              <div key={criterion.key} className="grid gap-3 rounded-lg border border-neutral-200 bg-white p-3 sm:grid-cols-[minmax(0,1fr)_8rem_auto] sm:items-end">
                <label className="block space-y-1 text-sm font-medium text-neutral-700">
                  Criterio {index + 1}
                  <input
                    value={criterion.name}
                    onChange={(event) => updateCriterion(criterion.key, { name: event.target.value })}
                    required
                    minLength={2}
                    maxLength={150}
                    placeholder="Ej. Vestimenta y presentación"
                    className="w-full rounded-lg border border-neutral-300 px-3 py-2 font-normal text-neutral-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </label>
                <label className="block space-y-1 text-sm font-medium text-neutral-700">
                  Porcentaje
                  <div className="relative">
                    <input
                      type="number"
                      value={criterion.weight || ""}
                      onChange={(event) =>
                        updateCriterion(criterion.key, {
                          weight: event.target.value === "" ? 0 : Number(event.target.value),
                        })
                      }
                      required
                      min={1}
                      max={100}
                      step={1}
                      aria-label={`Porcentaje del criterio ${index + 1}`}
                      className="w-full rounded-lg border border-neutral-300 px-3 py-2 pr-8 font-normal text-neutral-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <span className="absolute right-3 top-2 text-neutral-500">%</span>
                  </div>
                </label>
                <Button
                  type="button"
                  className="w-auto bg-red-50 text-red-700 shadow-none ring-0 hover:bg-red-100 hover:shadow-none"
                  disabled={criteriaDraft.length === 1}
                  aria-label={`Eliminar criterio ${index + 1}`}
                  onClick={() => setCriteriaDraft((previous) => previous.filter(({ key }) => key !== criterion.key))}
                >
                  Quitar
                </Button>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              className="w-auto bg-neutral-100 text-neutral-700 shadow-none ring-0 hover:bg-neutral-200 hover:shadow-none"
              disabled={criteriaDraft.length >= 20}
              onClick={() =>
                setCriteriaDraft((previous) => [
                  ...previous,
                  { key: crypto.randomUUID(), name: "", weight: 0 },
                ])
              }
            >
              Agregar criterio
            </Button>
            <p className={`text-sm font-semibold ${totalWeight === 100 ? "text-emerald-700" : "text-amber-700"}`} aria-live="polite">
              Total: {totalWeight}% {totalWeight === 100 ? "· Correcto" : "· Debe ser 100%"}
            </p>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-neutral-200" aria-label={`Porcentaje asignado: ${totalWeight}%`}>
            <div
              className={`h-full transition-all ${totalWeight === 100 ? "bg-emerald-500" : "bg-amber-400"}`}
              style={{ width: `${Math.min(totalWeight, 100)}%` }}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              disabled={
                isSaving ||
                totalWeight !== 100 ||
                criteriaDraft.some((criterion) => criterion.name.trim().length < 2 || criterion.weight < 1) ||
                new Set(criteriaDraft.map(({ name }) => name.trim().toLocaleLowerCase())).size !== criteriaDraft.length
              }
            >
              {isSaving ? "Guardando…" : "Guardar rúbrica"}
            </Button>
            {criteria.length > 0 && (
              <Button
                type="button"
                className="w-auto bg-neutral-100 text-neutral-700 shadow-none ring-0 hover:bg-neutral-200 hover:shadow-none"
                onClick={() => {
                  setError(null);
                  setCriteriaDraft(
                    criteria.map((criterion) => ({
                      key: criterion.id,
                      name: criterion.name,
                      weight: criterion.weight,
                    }))
                  );
                  setIsConfiguring(false);
                }}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      ) : criteria.length === 0 ? (
        <Button type="button" onClick={() => setIsConfiguring(true)}>
          Crear rúbrica de calificación
        </Button>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {criteria.map((criterion) => (
              <span key={criterion.id} className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-800">
                {criterion.name} · {criterion.weight}%
              </span>
            ))}
          </div>
          {hasSavedGrades && (
            <p className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800">
              La rúbrica queda protegida al guardar la primera calificación para conservar las notas ya registradas.
            </p>
          )}

          <div className="overflow-x-auto rounded-xl border border-neutral-200">
            <table className="min-w-full divide-y divide-neutral-200 text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th scope="col" className="sticky left-0 min-w-48 bg-neutral-50 px-4 py-3 text-left font-semibold text-neutral-700">
                    Estudiante
                  </th>
                  {criteria.map((criterion) => (
                    <th scope="col" key={criterion.id} className="min-w-36 px-3 py-3 text-center font-semibold text-neutral-700">
                      <span className="block">{criterion.name}</span>
                      <span className="text-xs font-normal text-neutral-500">{criterion.weight}% · nota 0,0–5,0</span>
                    </th>
                  ))}
                  <th scope="col" className="min-w-32 px-4 py-3 text-center font-semibold text-neutral-700">
                    Nota final
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 bg-white">
                {group.members.map(({ responseId, student }) => {
                  const isStudentComplete = criteria.every(
                    (criterion) => hasScoreValue(scores[getScoreKey(responseId, criterion.id)])
                  );
                  const finalGrade = isStudentComplete
                    ? Math.round(
                        (criteria.reduce(
                          (total, criterion) =>
                            total +
                            Number(scores[getScoreKey(responseId, criterion.id)]) *
                              (criterion.weight / 100),
                          0
                        ) + Number.EPSILON) * 10
                      ) / 10
                    : null;

                  return (
                    <tr key={responseId}>
                      <th scope="row" className="sticky left-0 bg-white px-4 py-3 text-left font-medium text-neutral-800">
                        {student.fullName}
                      </th>
                      {criteria.map((criterion) => {
                        const key = getScoreKey(responseId, criterion.id);
                        return (
                          <td key={criterion.id} className="px-3 py-3">
                            <input
                              type="number"
                              min={0}
                              max={5}
                              step={0.1}
                              inputMode="numeric"
                              value={scores[key] ?? ""}
                              onChange={(event) =>
                                setScores((previous) => ({ ...previous, [key]: event.target.value }))
                              }
                              aria-label={`Calificación de ${student.fullName} en ${criterion.name}`}
                              className="w-full rounded-lg border border-neutral-300 px-2 py-2 text-center text-neutral-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-emerald-500/20"
                            />
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-center">
                        {finalGrade === null ? (
                          <span className="text-xs text-neutral-500">
                            Pendiente ({criteria.filter((criterion) => hasScoreValue(scores[getScoreKey(responseId, criterion.id)])).length}/{criteria.length})
                          </span>
                        ) : (
                          <span className="font-semibold text-brand-800">{formatGrade(finalGrade)}/5,0</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-neutral-50">
                <tr>
                  <th scope="row" colSpan={criteria.length + 2} className="px-4 py-2 text-left text-xs font-medium text-neutral-600">
                    Avance: {completedScores}/{scoreCells.length} calificaciones registradas
                    {isComplete ? " · Todos los estudiantes tienen nota final" : ""}
                  </th>
                </tr>
              </tfoot>
            </table>
          </div>

          <Button type="button" disabled={isSaving || !hasScoreChanges || !scoresAreValid} onClick={() => void handleSaveGrades()}>
            {isSaving ? "Guardando…" : "Guardar calificaciones"}
          </Button>
        </>
      )}
    </div>
  );
};

export default GroupAssessment;
