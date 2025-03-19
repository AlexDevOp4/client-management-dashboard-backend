/*
  Warnings:

  - Changed the type of `reps` on the `WorkoutExercise` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "WorkoutExercise" DROP COLUMN "reps",
ADD COLUMN     "reps" JSONB NOT NULL;
