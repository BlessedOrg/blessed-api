/*
  Warnings:

  - You are about to drop the column `metadataUrl` on the `SmartContract` table. All the data in the column will be lost.
  - You are about to drop the `ApiToken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ApiToken" DROP CONSTRAINT "ApiToken_appId_fkey";

-- DropForeignKey
ALTER TABLE "ApiToken" DROP CONSTRAINT "ApiToken_developerId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_developerId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- AlterTable
ALTER TABLE "SmartContract" DROP COLUMN "metadataUrl",
ADD COLUMN     "metadataImgUrl" TEXT;

-- DropTable
DROP TABLE "ApiToken";

-- DropTable
DROP TABLE "Session";

-- DropEnum
DROP TYPE "sessionType";

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "appId" TEXT NOT NULL,
    "userId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeveloperSession" (
    "id" TEXT NOT NULL,
    "developerId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeveloperSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_accessToken_key" ON "UserSession"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_refreshToken_key" ON "UserSession"("refreshToken");

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeveloperSession" ADD CONSTRAINT "DeveloperSession_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "DeveloperAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
