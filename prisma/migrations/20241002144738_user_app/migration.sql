/*
  Warnings:

  - You are about to drop the column `appId` on the `DevelopersUserAccount` table. All the data in the column will be lost.
  - You are about to drop the column `developerId` on the `DevelopersUserAccount` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "DevelopersUserAccount" DROP CONSTRAINT "DevelopersUserAccount_appId_fkey";

-- DropForeignKey
ALTER TABLE "DevelopersUserAccount" DROP CONSTRAINT "DevelopersUserAccount_developerId_fkey";

-- AlterTable
ALTER TABLE "DevelopersUserAccount" DROP COLUMN "appId",
DROP COLUMN "developerId";

-- CreateTable
CREATE TABLE "AppUser" (
    "appId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppUser_pkey" PRIMARY KEY ("appId","userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppUser_appId_userId_key" ON "AppUser"("appId", "userId");

-- AddForeignKey
ALTER TABLE "AppUser" ADD CONSTRAINT "AppUser_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppUser" ADD CONSTRAINT "AppUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "DevelopersUserAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
