/*
  Warnings:

  - Added the required column `vaultKey` to the `ApiToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ApiToken" ADD COLUMN     "developerId" TEXT,
ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "vaultKey" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "ApiToken" ADD CONSTRAINT "ApiToken_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "DeveloperAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
