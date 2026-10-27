export interface GroupMember {
  responseId: string;
  student: { id: string; fullName: string; email: string; documentId: string };
}

export interface GroupEvaluationResult {
  label: string;
  count: number;
  percentage: number;
}

export interface GroupQuestionEvaluation {
  questionId: string;
  text: string;
  type: string;
  totalMembers: number;
  answeredCount: number;
  results: GroupEvaluationResult[];
}

export interface GroupAssessmentGrade {
  responseId: string;
  score: number;
}

export interface GroupAssessmentCriterion {
  id: string;
  name: string;
  weight: number;
  order: number;
  grades: GroupAssessmentGrade[];
}

export interface GroupAssessment {
  criteria: GroupAssessmentCriterion[];
}

export interface StudentGroup {
  id: string;
  name: string;
  formId: string;
  createdAt: string;
  members: GroupMember[];
  evaluations: GroupQuestionEvaluation[];
  assessment: GroupAssessment | null;
}

export interface StudentGroupPayload {
  name: string;
  responseIds: string[];
}

export interface GroupAssessmentCriterionInput {
  name: string;
  weight: number;
}

export interface GroupAssessmentGradeInput {
  criterionId: string;
  responseId: string;
  score: number | null;
}