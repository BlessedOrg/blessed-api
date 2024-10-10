/*
  Warnings:

  - You are about to drop the `AccountOtp` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AccountOtp" DROP CONSTRAINT "AccountOtp_developerId_fkey";

-- DropForeignKey
ALTER TABLE "AccountOtp" DROP CONSTRAINT "AccountOtp_userId_fkey";

-- DropTable
DROP TABLE "AccountOtp";

-- CreateTable
CREATE TABLE "ApiToken" (
    "id" TEXT NOT NULL,
    "apiTokenVaultKey" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApiToken_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ApiToken" ADD CONSTRAINT "ApiToken_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
