-- CreateTable
CREATE TABLE "SmartContract" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "developerUserId" TEXT,
    "userVersion" INTEGER NOT NULL,

    CONSTRAINT "SmartContract_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SmartContract" ADD CONSTRAINT "SmartContract_developerUserId_fkey" FOREIGN KEY ("developerUserId") REFERENCES "DevelopersUserAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
