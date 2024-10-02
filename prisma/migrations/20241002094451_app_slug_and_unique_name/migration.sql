/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `App` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `App` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id,slug]` on the table `App` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `appSlug` to the `ApiToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `App` table without a default value. This is not possible if the table is not empty.
  - Added the required column `appSlug` to the `DevelopersUserAccount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `appSlug` to the `SmartContract` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ApiToken" DROP CONSTRAINT "ApiToken_appId_fkey";

-- DropForeignKey
ALTER TABLE "DevelopersUserAccount" DROP CONSTRAINT "DevelopersUserAccount_appId_fkey";

-- DropForeignKey
ALTER TABLE "SmartContract" DROP CONSTRAINT "SmartContract_appId_fkey";

-- AlterTable
ALTER TABLE "ApiToken" ADD COLUMN     "appSlug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "App" ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DevelopersUserAccount" ADD COLUMN     "appSlug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SmartContract" ADD COLUMN     "appSlug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "App_slug_key" ON "App"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "App_name_key" ON "App"("name");

-- CreateIndex
CREATE UNIQUE INDEX "App_id_slug_key" ON "App"("id", "slug");

-- AddForeignKey
ALTER TABLE "DevelopersUserAccount" ADD CONSTRAINT "DevelopersUserAccount_appId_appSlug_fkey" FOREIGN KEY ("appId", "appSlug") REFERENCES "App"("id", "slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiToken" ADD CONSTRAINT "ApiToken_appId_appSlug_fkey" FOREIGN KEY ("appId", "appSlug") REFERENCES "App"("id", "slug") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmartContract" ADD CONSTRAINT "SmartContract_appId_appSlug_fkey" FOREIGN KEY ("appId", "appSlug") REFERENCES "App"("id", "slug") ON DELETE RESTRICT ON UPDATE CASCADE;
