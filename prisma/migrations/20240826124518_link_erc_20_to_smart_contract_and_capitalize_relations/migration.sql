/*
  Warnings:

  - Added the required column `smartContractId` to the `Erc20Token` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SmartContract` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Erc20Token" ADD COLUMN     "smartContractId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SmartContract" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "Erc20Token" ADD CONSTRAINT "Erc20Token_smartContractId_fkey" FOREIGN KEY ("smartContractId") REFERENCES "SmartContract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
