import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function backfillWorkoutExercises() {
  try {
    const exercises = await prisma.workoutExercise.findMany();

    for (const exercise of exercises) {
      await prisma.workoutExercise.update({
        where: { id: exercise.id },
        data: {
          weekNumber: 1, // ✅ Default to 1 for now
          originalWeek: 1, // ✅ Assume all existing ones started at Week 1
        },
      });
    }

    console.log("Backfill complete!");
  } catch (error) {
    console.error("Error backfilling workout exercises:", error);
  } finally {
    await prisma.$disconnect();
  }
}

backfillWorkoutExercises();
