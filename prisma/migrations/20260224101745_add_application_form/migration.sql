-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "elder_requests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "certificates" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "cvUrl" TEXT,
    "documentsUrl" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewNote" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "elder_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "elder_requests_userId_idx" ON "elder_requests"("userId");

-- CreateIndex
CREATE INDEX "elder_requests_status_idx" ON "elder_requests"("status");

-- AddForeignKey
ALTER TABLE "elder_requests" ADD CONSTRAINT "elder_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
