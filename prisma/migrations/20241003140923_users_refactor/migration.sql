/*
  Warnings:

  - You are about to drop the column `developerUserId` on the `AccountOtp` table. All the data in the column will be lost.
  - You are about to drop the column `developerUserId` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `developerUserId` on the `SmartContractInteraction` table. All the data in the column will be lost.
  - You are about to drop the `DevelopersUserAccount` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `SmartContractInteraction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AccountOtp" DROP CONSTRAINT "AccountOtp_developerUserId_fkey";

-- DropForeignKey
ALTER TABLE "AppUser" DROP CONSTRAINT "AppUser_userId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_developerUserId_fkey";

-- DropForeignKey
ALTER TABLE "SmartContractInteraction" DROP CONSTRAINT "SmartContractInteraction_developerUserId_fkey";

-- AlterTable
ALTER TABLE "AccountOtp" DROP COLUMN "developerUserId",
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "developerUserId",
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "SmartContractInteraction" DROP COLUMN "developerUserId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "DevelopersUserAccount";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "walletAddress" TEXT,
    "capsuleTokenVaultKey" TEXT,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- AddForeignKey
ALTER TABLE "AppUser" ADD CONSTRAINT "AppUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountOtp" ADD CONSTRAINT "AccountOtp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmartContractInteraction" ADD CONSTRAINT "SmartContractInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
