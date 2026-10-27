import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { UsersIcon } from "../../components/icons/Icons";
import GroupAssessment from "../../components/teacher/GroupAssessment";
import { Alert } from "../../components/ui/Alert";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonList } from "../../components/ui/SkeletonList";
import { getApiErrorMessage } from "../../lib/api";
import { deleteGroup, getGroupsForForm, createGroup, updateGroup } from "../../services/groups.service";
import { getFormForTeacher, getResponsesForForm } from "../../services/forms.service";
import { StudentGroup } from "../../types/group";
import { FormDetailForTeacher } from "../../types/form";
import { TeacherResponseSummary } from "../../types/response";

const cardClass = "rounded-2xl border border-white/60 bg-white/70 p-6 shadow-sm backdrop-blur-xl";

const TeacherGroups = () => {
  const { formId } = useParams<{ formId: string }>();
  const [form, setForm] = useState<FormDetailForTeacher | null>(null);
  const [responses, setResponses] = useState<TeacherResponseSummary[]>([]);
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [name, setName] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingIds, setEditingIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!formId) return;
    setLoading(true);
    setError(null);
    try {
      const [formData, responseData, groupData] = await Promise.all([
        getFormForTeacher(formId),
        getResponsesForForm(formId),
        getGroupsForForm(formId),
      ]);
      setForm(formData);
      setResponses(responseData);
      setGroups(groupData);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => { void loadData(); }, [loadData]);

  const assignedGroupByResponse = useMemo(() => {
    const assignments = new Map<string, string>();
    groups.forEach((group) => group.members.forEach((member) => assignments.set(member.responseId, group.id)));
    return assignments;
  }, [groups]);

  const toggleSelection = (responseId: string, current: string[], setCurrent: (ids: string[]) => void) => {
    setCurrent(current.includes(responseId)
      ? current.filter((id) => id !== responseId)
      : [...current, responseId]);
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!formId) return;
    setSaving(true);
    setError(null);
    try {
      await createGroup(formId, { name: name.trim(), responseIds: selectedIds });
      setName("");
      setSelectedIds([]);
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMembers = async (group: StudentGroup) => {
    setSaving(true);
    setError(null);
    try {
      await updateGroup(group.id, { name: group.name, responseIds: editingIds });
      setEditingGroupId(null);
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (group: StudentGroup) => {
    if (!window.confirm(`¿Eliminar el grupo "${group.name}"?`)) return;
    setError(null);
    try {
      await deleteGroup(group.id);
      await loadData();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  const renderStudentPicker = (current: string[], setCurrent: (ids: string[]) => void, groupId?: string) => (
    <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-neutral-200 p-3">
      {responses.map((response) => {
        const assignedTo = assignedGroupByResponse.get(response.id);
        const isAvailable = !assignedTo || assignedTo === groupId;
        return (
          <label key={response.id} className={`flex items-center gap-3 rounded-lg p-2 text-sm ${isAvailable ? "cursor-pointer hover:bg-brand-50" : "opacity-50"}`}>
            <input
              type="checkbox"
              checked={current.includes(response.id)}
              disabled={!isAvailable}
              onChange={() => toggleSelection(response.id, current, setCurrent)}
              className="h-4 w-4 rounded text-brand-600 focus:ring-emerald-500"
            />
            <span className="min-w-0">
              <span className="block font-medium text-neutral-800">{response.student.fullName}</span>
              <span className="block truncate text-xs text-neutral-500">{response.student.email}{!isAvailable ? " · Ya está en otro grupo" : ""}</span>
            </span>
          </label>
        );
      })}
      {responses.length === 0 && <p className="text-sm text-neutral-500">Aún no hay estudiantes con respuestas enviadas.</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <Link to={`/teacher/forms/${formId}/responses`} className="text-sm font-medium text-brand-700 hover:text-brand-800">Volver a respuestas</Link>
        <h1 className="mt-2 text-2xl font-semibold text-neutral-900">Grupos de estudiantes</h1>
        {form && <p className="mt-1 text-sm text-neutral-500">{form.title} · {responses.length} estudiantes inscritos</p>}
      </div>

      {error && <Alert message={error} />}
      {loading ? <SkeletonList rows={3} /> : !form ? null : <>
        <form onSubmit={handleCreate} className={`${cardClass} space-y-4`}>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">Crear grupo</h2>
            <p className="mt-1 text-sm text-neutral-500">Selecciona estudiantes que ya enviaron una respuesta. Cada estudiante puede pertenecer a un solo grupo de este formulario.</p>
          </div>
          <label className="block space-y-1.5 text-sm font-medium text-neutral-700">
            Nombre del grupo
            <input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={100} placeholder="Ej. Equipo 1" className="w-full rounded-lg border-2 border-neutral-200 px-3 py-2.5 font-normal text-neutral-900 outline-none focus:border-brand-400 focus:ring-4 focus:ring-emerald-500/20" />
          </label>
          {renderStudentPicker(selectedIds, setSelectedIds)}
          <Button type="submit" disabled={saving || !name.trim() || selectedIds.length === 0}>{saving ? "Guardando…" : `Crear grupo (${selectedIds.length})`}</Button>
        </form>

        {groups.length === 0 ? (
          <EmptyState icon={UsersIcon} message="Todavía no has creado grupos para este formulario." />
        ) : (
          <div className="space-y-5">
            {groups.map((group) => {
              const hasGrades =
                group.assessment?.criteria.some((criterion) => criterion.grades.length > 0) ?? false;
              return (
              <section key={group.id} className={`${cardClass} space-y-5`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900">{group.name}</h2>
                    <p className="mt-1 text-sm text-neutral-500">{group.members.length} integrantes</p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" className="w-auto bg-neutral-100 text-neutral-700 shadow-none ring-0 hover:bg-neutral-200 hover:shadow-none" onClick={() => {
                      setEditingGroupId(editingGroupId === group.id ? null : group.id);
                      setEditingIds(group.members.map((member) => member.responseId));
                    }}>{editingGroupId === group.id ? "Cancelar" : "Editar integrantes"}</Button>
                    <Button type="button" disabled={hasGrades} title={hasGrades ? "No se puede eliminar un grupo con calificaciones registradas." : undefined} className="w-auto bg-red-50 text-red-700 shadow-none ring-0 hover:bg-red-100 hover:shadow-none" onClick={() => void handleDelete(group)}>Eliminar</Button>
                  </div>
                </div>

                {editingGroupId === group.id ? (
                  <div className="space-y-3 border-t border-neutral-100 pt-4">
                    {renderStudentPicker(editingIds, setEditingIds, group.id)}
                    <Button type="button" disabled={saving || editingIds.length === 0} onClick={() => void handleSaveMembers(group)}>Guardar integrantes</Button>
                  </div>
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {group.members.map(({ responseId, student }) => <li key={responseId} className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-800">{student.fullName}</li>)}
                  </ul>
                )}

                <div className="space-y-4 border-t border-neutral-100 pt-4">
                  <div>
                    <h3 className="font-semibold text-neutral-900">Evaluación por pregunta</h3>
                    <p className="text-xs text-neutral-500">Porcentaje del total de integrantes que eligió o escribió cada respuesta.</p>
                  </div>
                  {group.evaluations.map((evaluation, index) => (
                    <div key={evaluation.questionId} className="space-y-3 rounded-xl bg-neutral-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold text-neutral-800">{index + 1}. {evaluation.text}</h4>
                        <span className="text-xs text-neutral-500">Respondieron {evaluation.answeredCount}/{evaluation.totalMembers}</span>
                      </div>
                      {evaluation.results.length === 0 ? <p className="text-sm text-neutral-500">Aún no hay respuestas.</p> : evaluation.results.map((result) => (
                        <div key={result.label}>
                          <div className="mb-1 flex justify-between gap-3 text-xs text-neutral-600">
                            <span className="break-all">{result.label}</span>
                            <span className="shrink-0 font-semibold">{result.percentage}% ({result.count})</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
                            <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-emerald-500" style={{ width: `${Math.min(result.percentage, 100)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <GroupAssessment group={group} onUpdated={loadData} />
              </section>
              );
            })}
          </div>
        )}
      </>}
    </div>
  );
};

export default TeacherGroups;