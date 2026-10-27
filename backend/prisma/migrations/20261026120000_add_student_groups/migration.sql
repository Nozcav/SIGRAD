-- CreateTable
CREATE TABLE "StudentGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentGroupMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentGroupMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentGroup_formId_idx" ON "StudentGroup"("formId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentGroupMember_responseId_key" ON "StudentGroupMember"("responseId");

-- AddForeignKey
ALTER TABLE "StudentGroup" ADD CONSTRAINT "StudentGroup_formId_fkey" FOREIGN KEY ("formId") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGroup" ADD CONSTRAINT "StudentGroup_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGroupMember" ADD CONSTRAINT "StudentGroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "StudentGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentGroupMember" ADD CONSTRAINT "StudentGroupMember_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "Response"("id") ON DELETE CASCADE ON UPDATE CASCADE;