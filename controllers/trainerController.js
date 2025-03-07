import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getTrainersClients = async (req, res) => {
  const { userId } = req.params;

  try {
    const clients = await prisma.clientProfile.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
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

// GET /api/trainers/:trainerId/clients/:clientId/exercises/:exerciseId/progress?startDate=2025-01-01&endDate=2025-02-24
export const filterProgress = async (req, res) => {
  const { clientId, trainerId, exerciseId } = req.params;
  const { startDate, endDate } = req.query;

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

    if (startDate && isNaN(new Date(startDate).getTime())) {
      return res.status(400).json({ error: "Invalid startDate format" });
    }
    if (endDate && isNaN(new Date(endDate).getTime())) {
      return res.status(400).json({ error: "Invalid endDate format" });
    }

    const logs = await prisma.workoutLog.findMany({
      where: {
        clientId,
        exerciseId,
        ...(startDate || endDate
          ? {
              logDate: {
                gte: startDate ? new Date(startDate) : undefined,
                lte: endDate
                  ? new Date(new Date(endDate).setHours(23, 59, 59, 999))
                  : undefined,
              },
            }
          : {}),
      },
      orderBy: { logDate: "asc" },
    });

    const highestWeightUsed = logs.length
      ? Math.max(...logs.map((log) => log.weightUsed || 0))
      : null;

    const highestRepsCompleted = logs.length
      ? Math.max(...logs.map((log) => log.repsCompleted || 0))
      : null;

    const bestSession = logs.length
      ? logs.reduce((best, log) => {
          if (!best || log.weightUsed > best.weightUsed) {
            return log;
          }
          return best;
        }, null)
      : null;

    const weightProgress = logs
      .filter((log) => log.weightUsed)
      .map((log) => ({
        date: log.logDate,
        reps: log.weightUsed,
      }));

    const repsProgress = logs
      .filter((log) => log.repsCompleted)
      .map((log) => ({
        date: log.logDate,
        reps: log.repsCompleted,
      }));

    res.status(200).json({
      exercise,
      progress: logs,
      highestWeightUsed,
      highestRepsCompleted,
      bestSession,
      weightProgress,
      repsProgress,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching logs" });
  }
};

// GET /trainer/{trainerId}/dashboard-stats

export const getDashboardStats = async (req, res) => {
  const { trainerId } = req.params; // Use params instead of query

  try {
    // Get total number of clients assigned to the trainer
    const totalClients = await prisma.clientProfile.count({
      where: { trainerId },
    });

    // Get total workouts assigned by the trainer
    const totalWorkouts = await prisma.workout.count({
      where: { trainerId },
    });

    // Get the trainer's clients' workout logs (filtered correctly)
    const recentLogs = await prisma.workoutLog.findMany({
      where: {
        clientId: {
          in: (
            await prisma.clientProfile.findMany({
              where: { trainerId },
              select: { userId: true },
            })
          ).map((client) => client.userId),
        },
      },
      orderBy: { logDate: "desc" },
      take: 5, // Only fetch last 5 logs for performance
      include: {
        client: {
          include: {
            clientProfile: { select: { name: true } },
          },
        },
        exercise: { select: { name: true } },
      },
    });

    res.status(200).json({
      totalClients,
      totalWorkouts,
      recentLogs: recentLogs.map((log) => ({
        clientName: log.client.clientProfile.name,
        exerciseName: log.exercise.name,
        logDate: log.logDate,
      })),
    });
  } catch (error) {
    console.error("Error fetching trainer dashboard stats:", error);
    res.status(500).json({ error: "Error fetching stats" });
  }
};
