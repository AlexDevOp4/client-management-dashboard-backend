-- AlterTable
ALTER TABLE "WorkoutExercise" ADD COLUMN     "actualReps" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "weight" JSONB NOT NULL DEFAULT '[]',
ALTER COLUMN "reps" SET DEFAULT '[]';
