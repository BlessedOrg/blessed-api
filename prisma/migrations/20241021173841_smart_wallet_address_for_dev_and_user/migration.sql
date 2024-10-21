/*
  Warnings:

  - A unique constraint covering the columns `[smartWalletAddress]` on the table `DeveloperAccount` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[smartWalletAddress]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "DeveloperAccount" ADD COLUMN     "smartWalletAddress" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "smartWalletAddress" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "DeveloperAccount_smartWalletAddress_key" ON "DeveloperAccount"("smartWalletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "User_smartWalletAddress_key" ON "User"("smartWalletAddress");
