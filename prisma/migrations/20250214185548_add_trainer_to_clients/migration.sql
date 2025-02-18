/*
  Warnings:

  - You are about to drop the column `progressPics` on the `ClientProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ClientProfile" DROP COLUMN "progressPics",
ADD COLUMN     "trainerId" TEXT;

-- CreateTable
CREATE TABLE "ProgressPic" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgressPic_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ClientProfile" ADD CONSTRAINT "ClientProfile_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgressPic" ADD CONSTRAINT "ProgressPic_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "ClientProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
