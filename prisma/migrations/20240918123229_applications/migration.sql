-- AlterTable
ALTER TABLE "ApiToken" ADD COLUMN     "developerApplicationId" TEXT,
ADD COLUMN     "revoked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SmartContract" ADD COLUMN     "developerApplicationId" TEXT;

-- AlterTable
ALTER TABLE "SmartContractInteraction" ADD COLUMN     "developerApplicationId" TEXT;

-- CreateTable
CREATE TABLE "DeveloperApplication" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "developerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeveloperApplication_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ApiToken" ADD CONSTRAINT "ApiToken_developerApplicationId_fkey" FOREIGN KEY ("developerApplicationId") REFERENCES "DeveloperApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmartContract" ADD CONSTRAINT "SmartContract_developerApplicationId_fkey" FOREIGN KEY ("developerApplicationId") REFERENCES "DeveloperApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmartContractInteraction" ADD CONSTRAINT "SmartContractInteraction_developerApplicationId_fkey" FOREIGN KEY ("developerApplicationId") REFERENCES "DeveloperApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeveloperApplication" ADD CONSTRAINT "DeveloperApplication_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "DeveloperAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
