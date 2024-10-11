/*
  Warnings:

  - You are about to drop the `Erc20Token` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Erc20Token" DROP CONSTRAINT "Erc20Token_developerId_fkey";

-- DropForeignKey
ALTER TABLE "Erc20Token" DROP CONSTRAINT "Erc20Token_smartContractId_fkey";

-- DropTable
DROP TABLE "Erc20Token";
