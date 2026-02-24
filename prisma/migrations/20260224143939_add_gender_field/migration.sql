-- AlterTable
ALTER TABLE "users" ADD COLUMN     "gender" TEXT,
ADD COLUMN     "twoFactorCode" TEXT,
ADD COLUMN     "twoFactorExpiry" TIMESTAMP(3);
