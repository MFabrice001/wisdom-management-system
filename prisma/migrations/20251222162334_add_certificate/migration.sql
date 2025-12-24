/*
  Warnings:

  - You are about to drop the column `certificateId` on the `quiz_attempts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "quiz_attempts" DROP COLUMN "certificateId";

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_quizAttemptId_fkey" FOREIGN KEY ("quizAttemptId") REFERENCES "quiz_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
