/*
  Warnings:

  - Made the column `originalWeek` on table `WorkoutExercise` required. This step will fail if there are existing NULL values in that column.
  - Made the column `weekNumber` on table `WorkoutExercise` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "WorkoutExercise" ALTER COLUMN "originalWeek" SET NOT NULL,
ALTER COLUMN "weekNumber" SET NOT NULL;
