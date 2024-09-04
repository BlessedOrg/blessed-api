/*
  Warnings:

  - A unique constraint covering the columns `[address]` on the table `SmartContract` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "SmartContractInteractionType" AS ENUM ('gasless', 'operator', 'wallet');

-- CreateTable
CREATE TABLE "SmartContractInteraction" (
    "id" TEXT NOT NULL,
    "developerUserId" TEXT NOT NULL,
    "smartContractId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "txHash" TEXT NOT NULL,
    "output" JSONB,
    "input" JSONB,
    "fees" TEXT,
    "type" "SmartContractInteractionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmartContractInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SmartContract_address_key" ON "SmartContract"("address");

-- AddForeignKey
ALTER TABLE "SmartContractInteraction" ADD CONSTRAINT "SmartContractInteraction_developerUserId_fkey" FOREIGN KEY ("developerUserId") REFERENCES "DevelopersUserAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmartContractInteraction" ADD CONSTRAINT "SmartContractInteraction_smartContractId_fkey" FOREIGN KEY ("smartContractId") REFERENCES "SmartContract"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
