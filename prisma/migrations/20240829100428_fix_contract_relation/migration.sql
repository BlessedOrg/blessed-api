/*
  Warnings:

  - You are about to drop the column `developerUserId` on the `SmartContract` table. All the data in the column will be lost.
  - You are about to drop the column `userVersion` on the `SmartContract` table. All the data in the column will be lost.
  - Added the required column `version` to the `SmartContract` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SmartContract" DROP CONSTRAINT "SmartContract_developerUserId_fkey";

-- AlterTable
ALTER TABLE "SmartContract" DROP COLUMN "developerUserId",
DROP COLUMN "userVersion",
ADD COLUMN     "developerId" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "SmartContract" ADD CONSTRAINT "SmartContract_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "DeveloperAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
