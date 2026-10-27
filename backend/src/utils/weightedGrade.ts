export interface WeightedGradeCriterion {
  id: string;
  weight: number;
}

export const calculateWeightedGradeTenths = (
  criteria: WeightedGradeCriterion[],
  scoresByCriterionId: ReadonlyMap<string, number | null>
): number | null => {
  if (
    criteria.length === 0 ||
    criteria.some((criterion) => scoresByCriterionId.get(criterion.id) === undefined || scoresByCriterionId.get(criterion.id) === null)
  ) {
    return null;
  }

  return Math.round(
    criteria.reduce(
      (total, criterion) =>
        total + (scoresByCriterionId.get(criterion.id) ?? 0) * (criterion.weight / 100),
      0
    )
  );
};
