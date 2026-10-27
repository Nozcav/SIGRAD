import assert from "node:assert/strict";
import test from "node:test";
import { saveAssessmentSchema, saveGradesSchema } from "./groups.schemas";
import { calculateWeightedGradeTenths } from "../../utils/weightedGrade";

const criterionId = "00000000-0000-4000-8000-000000000001";
const responseId = "00000000-0000-4000-8000-000000000002";

test("rubric percentages must sum to exactly 100", () => {
  assert.equal(
    saveAssessmentSchema.safeParse({
      criteria: [
        { name: "Vestimenta", weight: 35 },
        { name: "Trabajo en equipo", weight: 65 },
      ],
    }).success,
    true
  );
  assert.equal(
    saveAssessmentSchema.safeParse({
      criteria: [
        { name: "Vestimenta", weight: 35 },
        { name: "Trabajo en equipo", weight: 64 },
      ],
    }).success,
    false
  );
});

test("criterion grades accept tenths from 0.0 through 5.0 only", () => {
  for (const score of [0, 0.1, 4.3, 5]) {
    assert.equal(
      saveGradesSchema.safeParse({ grades: [{ criterionId, responseId, score }] }).success,
      true
    );
  }

  for (const score of [-0.1, 5.1, 4.35]) {
    assert.equal(
      saveGradesSchema.safeParse({ grades: [{ criterionId, responseId, score }] }).success,
      false
    );
  }
});

test("weighted grade rounds to one decimal and waits for every criterion", () => {
  const criteria = [
    { id: "presentation", weight: 40 },
    { id: "teamwork", weight: 60 },
  ];

  assert.equal(
    calculateWeightedGradeTenths(
      criteria,
      new Map([
        ["presentation", 40],
        ["teamwork", 45],
      ])
    ),
    43
  );
  assert.equal(
    calculateWeightedGradeTenths(
      criteria,
      new Map([
        ["presentation", 40],
        ["teamwork", null],
      ])
    ),
    null
  );
});
