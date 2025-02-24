/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Exercise` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category` to the `Exercise` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "category" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "WorkoutLog" ADD COLUMN     "distanceInMeters" DOUBLE PRECISION,
ADD COLUMN     "timeInSeconds" INTEGER,
ALTER COLUMN "setsCompleted" DROP NOT NULL,
ALTER COLUMN "repsCompleted" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_name_key" ON "Exercise"("name");
