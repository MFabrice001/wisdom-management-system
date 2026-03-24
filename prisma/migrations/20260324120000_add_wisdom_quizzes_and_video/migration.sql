-- Add video/reels and quiz features for wisdom
CREATE TABLE IF NOT EXISTS "wisdom_quizzes" (
    "id" TEXT NOT NULL,
    "wisdomId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "explanation" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "wisdom_quizzes_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "wisdom_quizzes_wisdomId_idx" ON "wisdom_quizzes" ("wisdomId");

CREATE TABLE IF NOT EXISTS "wisdom_quiz_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "selectedAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "wisdom_quiz_attempts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "wisdom_quiz_attempts_quizId_idx" ON "wisdom_quiz_attempts" ("quizId");
CREATE INDEX IF NOT EXISTS "wisdom_quiz_attempts_userId_idx" ON "wisdom_quiz_attempts" ("userId");

-- Add video fields to wisdoms table
ALTER TABLE "wisdoms" ADD COLUMN IF NOT EXISTS "videoUrl" TEXT;
ALTER TABLE "wisdoms" ADD COLUMN IF NOT EXISTS "videoThumbnail" TEXT;
