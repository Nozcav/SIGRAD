ALTER TABLE "GroupCriterionGrade"
    RENAME COLUMN "score" TO "scoreTenths";

UPDATE "GroupCriterionGrade"
SET "scoreTenths" = ROUND("scoreTenths" / 2.0)::INTEGER;

ALTER TABLE "GroupCriterionGrade"
    ADD CONSTRAINT "GroupCriterionGrade_scoreTenths_check"
    CHECK ("scoreTenths" >= 0 AND "scoreTenths" <= 50);
