/*
  Warnings:

  - You are about to drop the column `appSlug` on the `ApiToken` table. All the data in the column will be lost.
  - You are about to drop the column `appSlug` on the `DevelopersUserAccount` table. All the data in the column will be lost.
  - You are about to drop the column `appSlug` on the `SmartContract` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ApiToken" DROP CONSTRAINT "ApiToken_appId_appSlug_fkey";

-- DropForeignKey
ALTER TABLE "DevelopersUserAccount" DROP CONSTRAINT "DevelopersUserAccount_appId_appSlug_fkey";

-- DropForeignKey
ALTER TABLE "SmartContract" DROP CONSTRAINT "SmartContract_appId_appSlug_fkey";

-- DropIndex
DROP INDEX "App_id_slug_key";

-- AlterTable
ALTER TABLE "ApiToken" DROP COLUMN "appSlug";

-- AlterTable
ALTER TABLE "DevelopersUserAccount" DROP COLUMN "appSlug";

-- AlterTable
ALTER TABLE "SmartContract" DROP COLUMN "appSlug";

-- AddForeignKey
ALTER TABLE "DevelopersUserAccount" ADD CONSTRAINT "DevelopersUserAccount_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiToken" ADD CONSTRAINT "ApiToken_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmartContract" ADD CONSTRAINT "SmartContract_appId_fkey" FOREIGN KEY ("appId") REFERENCES "App"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
