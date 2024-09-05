/*
  Warnings:

  - Added the required column `metadataPayload` to the `SmartContract` table without a default value. This is not possible if the table is not empty.
  - Added the required column `metadataUrl` to the `SmartContract` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SmartContract" ADD COLUMN     "metadataPayload" JSONB NOT NULL,
ADD COLUMN     "metadataUrl" TEXT NOT NULL;
