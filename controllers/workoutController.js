import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// POST /api/workouts
// Create a new workout

export const createWorkout = async (req, res) => {
  const { trainerId, clientId, title, scheduledDate } = req.body;

  // Check if req.body.exercises is an array
  const exercises = req.body.exercises;
  if (!Array.isArray(exercises)) {
    return res.status(400).json({ error: "Exercises must be an array" });
  }

  // Validate before processing
  if (!exercises.every((ex) => ex.name && ex.category && ex.sets && ex.reps)) {
    return res.status(400).json({ error: "All fields are required." });
  }

  const checkedExercises = await Promise.all(
    exercises.map(async (exercise) => {
      const existingExercise = await prisma.exercise.findUnique({
        where: { name: exercise.name },
      });

      if (!existingExercise) {
        return await prisma.exercise.create({
          data: {
            name: exercise.name,
            category: exercise.category,
          },
        });
      }

      return existingExercise;
    })
  );

  try {
    const result = await prisma.$transaction(async (prisma) => {
      const workout = await prisma.workout.create({
        data: {
          title,
          scheduledDate: new Date(scheduledDate),
          trainerId,
          clientId,
        },
      });

      await Promise.all(
        checkedExercises.map((exercise, index) => {
          return prisma.workoutExercise.create({
            data: {
              workoutId: workout.id,
              exerciseId: exercise.id,
              sets: exercises[index].sets,
              reps: exercises[index].reps,
            },
          });
        })
      );

      const fullWorkout = await prisma.workout.findUnique({
        where: { id: workout.id },
        include: { workoutExercises: { include: { exercise: true } } },
      });

      return fullWorkout;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating workout:", error);
    res.status(500).json({ error: "Error creating workout" });
  }
};

// Log Exercises

export const logExercise = async (req, res) => {
  const {
    workoutId,
    exerciseId,
    clientId,
    setsCompleted,
    repsCompleted,
    weightUsed,
    notes,
    timeInSeconds,
    distanceInMeters,
  } = req.body;

  // Validate before processing
  if (!workoutId || !exerciseId || !clientId) {
    return res
      .status(400)
      .json({ error: "Workout ID, Client ID, and Exercise ID are required" });
  }

  try {
    const logEntry = await prisma.workoutLog.create({
      data: {
        workoutId,
        exerciseId,
        clientId,
        setsCompleted,
        repsCompleted,
        weightUsed,
        notes,
        timeInSeconds,
        distanceInMeters,
      },
    });

    const totalExercises = await prisma.workoutExercise.count({
      where: { workoutId },
    });

    const loggedExercises = await prisma.workoutLog.count({
      where: { workoutId, clientId },
    });

    if (loggedExercises >= totalExercises) {
      await prisma.workout.update({
        where: { id: workoutId },
        data: { status: "completed" },
      });
    }

    res.status(201).json(logEntry);
  } catch (error) {
    console.error("Error logging exercise:", error);
    res.status(500).json({ error: "Error logging exercise" });
  }
};

// GET LIST OF ALL EXERCISES

export const getExercises = async (req, res) => {
  try {
    const exercises = await prisma.exercise.findMany();
    res.status(200).json(exercises);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    res.status(500).json({ error: "Error fetching exercises" });
  }
};
