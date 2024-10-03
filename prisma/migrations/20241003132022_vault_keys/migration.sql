/*
  Warnings:

  - You are about to drop the column `vaultKey` on the `DeveloperAccount` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DeveloperAccount" DROP COLUMN "vaultKey",
ADD COLUMN     "accessTokenVaultKey" TEXT,
ADD COLUMN     "capsuleTokenVaultKey" TEXT;

-- AlterTable
ALTER TABLE "DevelopersUserAccount" ADD COLUMN     "capsuleTokenVaultKey" TEXT;
