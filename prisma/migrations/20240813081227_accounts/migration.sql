/*
  Warnings:

  - You are about to drop the column `userId` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserOtp` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[developerId]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[developerUserId]` on the table `Session` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserOtp" DROP CONSTRAINT "UserOtp_userId_fkey";

-- DropIndex
DROP INDEX "Session_userId_key";

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "userId",
ADD COLUMN     "developerId" TEXT,
ADD COLUMN     "developerUserId" TEXT;

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "UserOtp";

-- CreateTable
CREATE TABLE "DeveloperAccount" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "walletAddress" TEXT,
    "accountDeployed" BOOLEAN NOT NULL DEFAULT false,
    "vaultKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeveloperAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DevelopersUserAccount" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "walletAddress" TEXT,
    "developerId" TEXT NOT NULL,
    "accountDeployed" BOOLEAN NOT NULL DEFAULT false,
    "vaultKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sessionId" TEXT,

    CONSTRAINT "DevelopersUserAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountOtp" (
    "id" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "developerId" TEXT,
    "developerUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountOtp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiToken" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeveloperAccount_email_key" ON "DeveloperAccount"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DeveloperAccount_walletAddress_key" ON "DeveloperAccount"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "DevelopersUserAccount_email_key" ON "DevelopersUserAccount"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DevelopersUserAccount_walletAddress_key" ON "DevelopersUserAccount"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Session_developerId_key" ON "Session"("developerId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_developerUserId_key" ON "Session"("developerUserId");

-- AddForeignKey
ALTER TABLE "DevelopersUserAccount" ADD CONSTRAINT "DevelopersUserAccount_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "DeveloperAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountOtp" ADD CONSTRAINT "AccountOtp_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "DeveloperAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountOtp" ADD CONSTRAINT "AccountOtp_developerUserId_fkey" FOREIGN KEY ("developerUserId") REFERENCES "DevelopersUserAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "DeveloperAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_developerUserId_fkey" FOREIGN KEY ("developerUserId") REFERENCES "DevelopersUserAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
