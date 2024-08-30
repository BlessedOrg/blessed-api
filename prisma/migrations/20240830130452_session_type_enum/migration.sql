-- CreateEnum
CREATE TYPE "sessionType" AS ENUM ('dev', 'user');

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "sessionType" "sessionType" NOT NULL DEFAULT 'dev';
