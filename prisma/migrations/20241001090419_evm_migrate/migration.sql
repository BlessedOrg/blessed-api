/*
  Warnings:

  - You are about to drop the column `accountDeployed` on the `DeveloperAccount` table. All the data in the column will be lost.
  - You are about to drop the column `accountDeployed` on the `DevelopersUserAccount` table. All the data in the column will be lost.
  - You are about to drop the column `vaultKey` on the `DevelopersUserAccount` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DeveloperAccount" DROP COLUMN "accountDeployed";

-- AlterTable
ALTER TABLE "DevelopersUserAccount" DROP COLUMN "accountDeployed",
DROP COLUMN "vaultKey";
