/*
  Warnings:

  - The `repsCompleted` column on the `WorkoutLog` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `weightUsed` column on the `WorkoutLog` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "WorkoutLog" DROP COLUMN "repsCompleted",
ADD COLUMN     "repsCompleted" JSONB NOT NULL DEFAULT '[]',
DROP COLUMN "weightUsed",
ADD COLUMN     "weightUsed" JSONB NOT NULL DEFAULT '[]';
