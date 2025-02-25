import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getTrainersClients = async (req, res) => {
  const { userId } = req.params;

  try {
    const clients = await prisma.clientProfile.findMany({
      where: { userId },
    });

    if (!clients) {
      return res
        .status(404)
        .json({ error: "No clients found for this trainer" });
    }

    res.status(200).json(clients);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching clients" });
  }
};

// GET GET /api/trainers/:trainerId/clients/:clientId/workouts
export const trainerViewClientWorkoutHistory = async (req, res) => {
  const { clientId, trainerId } = req.params;

  try {
    const client = await prisma.clientProfile.findFirst({
      where: { userId: clientId, trainerId },
    });

    if (!client) {
      return res
        .status(403)
        .json({ error: "Client not found for this trainer" });
    }

    const workouts = await prisma.workout.findMany({
      where: { clientId, trainerId },
      include: {
        workoutExercises: {
          include: {
            exercise: true,
          },
        },
        logs: true,
      },
    });

    if (workouts.length === 0) {
      return res
        .status(404)
        .json({ error: "No workouts found for this client" });
    }

    res.status(200).json(workouts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching workouts" });
  }
};

// GET /api/trainers/:trainerId/clients/:clientId/exercises/:exerciseId/progress
export const getExerciseProgress = async (req, res) => {
  const { clientId, trainerId, exerciseId } = req.params;

  try {
    const client = await prisma.clientProfile.findFirst({
      where: { userId: clientId, trainerId },
    });

    if (!client) {
      return res
        .status(403)
        .json({ error: "Client not found for this trainer" });
    }

    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      return res.status(404).json({ error: "Exercise not found" });
    }

    const logs = await prisma.workoutLog.findMany({
      where: { clientId, exerciseId },
      orderBy: { logDate: "asc" },
    });

    res.status(200).json({ exercise, progress: logs });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching logs" });
  }
};
