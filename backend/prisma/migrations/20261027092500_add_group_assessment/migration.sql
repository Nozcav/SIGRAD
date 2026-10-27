CREATE TABLE "GroupAssessmentCriterion" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupAssessmentCriterion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GroupCriterionGrade" (
    "id" TEXT NOT NULL,
    "criterionId" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupCriterionGrade_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GroupAssessmentCriterion_groupId_order_idx"
    ON "GroupAssessmentCriterion"("groupId", "order");

CREATE UNIQUE INDEX "GroupCriterionGrade_criterionId_responseId_key"
    ON "GroupCriterionGrade"("criterionId", "responseId");

ALTER TABLE "GroupAssessmentCriterion"
    ADD CONSTRAINT "GroupAssessmentCriterion_groupId_fkey"
    FOREIGN KEY ("groupId") REFERENCES "StudentGroup"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GroupCriterionGrade"
    ADD CONSTRAINT "GroupCriterionGrade_criterionId_fkey"
    FOREIGN KEY ("criterionId") REFERENCES "GroupAssessmentCriterion"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GroupCriterionGrade"
    ADD CONSTRAINT "GroupCriterionGrade_responseId_fkey"
    FOREIGN KEY ("responseId") REFERENCES "Response"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
