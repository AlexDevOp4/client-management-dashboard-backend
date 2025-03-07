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

      await prisma.workoutProgram.update({
        where: { id: programId },
        data: { status: "completed" },
      });
    }

    // Check if all workouts are completed
    const totalWorkouts = await prisma.workout.count({
      where: { clientId, trainerId: req.user.id, status: "pending" },
    });

    if (totalWorkouts === 0) {
      await prisma.workoutProgram.update({
        where: { id: programId },
        data: { status: "completed" },
      });
    }

    await prisma.clientProfile.update({
      where: { userId: clientId },
      data: { lastWorkoutDate: new Date() },
    });

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

export const createWorkoutProgram = async (req, res) => {
  const { trainerId, clientId, title, durationWeeks, repeateWeek, weeks } =
    req.body;

  try {
    // 1. Validate Required Fields
    if (!trainerId || !clientId || !title) {
      return res
        .status(400)
        .json({ error: "Trainer ID, Client ID, and Title are required." });
    }

    if (!weeks || weeks.length === 0) {
      return res.status(400).json({ error: "At least one week is required." });
    }

    if (!durationWeeks || durationWeeks !== weeks.length) {
      return res.status(400).json({
        error:
          "Invalid durationWeeks value. It must match the number of weeks.",
      });
    }

    // 2. Validate Each Week
    for (const [weekIndex, week] of weeks.entries()) {
      if (!week.days || week.days.length === 0) {
        return res
          .status(400)
          .json({ error: `Week ${weekIndex + 1} must have at least one day.` });
      }

      // 3. Validate Each Day in the Week
      for (const [dayIndex, day] of week.days.entries()) {
        if (!day.exercises || day.exercises.length === 0) {
          return res.status(400).json({
            error: `Week ${weekIndex + 1}, Day ${dayIndex + 1} must have at least one exercise.`,
          });
        }

        // 4. Validate Each Exercise
        for (const [exerciseIndex, exercise] of day.exercises.entries()) {
          if (!exercise.name || !exercise.category) {
            return res.status(400).json({
              error: `Exercise ${exerciseIndex + 1} in Week ${weekIndex + 1}, Day ${dayIndex + 1} is missing a name or category.`,
            });
          }

          if (
            exercise.category === "Strength" &&
            (!exercise.sets || !exercise.reps)
          ) {
            return res.status(400).json({
              error: `Strength exercise "${exercise.name}" in Week ${weekIndex + 1}, Day ${dayIndex + 1} requires sets and reps.`,
            });
          }

          if (
            exercise.category === "Cardio" &&
            !exercise.distance &&
            !exercise.calories
          ) {
            return res.status(400).json({
              error: `Cardio exercise "${exercise.name}" in Week ${weekIndex + 1}, Day ${dayIndex + 1} requires distance or calories.`,
            });
          }
        }
      }
    }

    // Create the Workout Program
    const program = await prisma.workoutProgram.create({
      data: {
        trainerId,
        clientId,
        title,
        durationWeeks,
        repeateWeek,
      },
    });

    // Loop Through Weeks
    for (let i = 0; i < durationWeeks; i++) {
      const createdWeek = await prisma.workoutWeek.create({
        data: {
          programId: program.id,
          weekNumber: i + 1,
        },
      });

      // Loop Through Days
      for (const day of weeks[i]?.days || []) {
        // First, Create Workout for the Day
        const workout = await prisma.workout.create({
          data: {
            trainerId,
            clientId,
            title: day.title || `Workout Day ${day.dayNumber}`,
            scheduledDate: new Date(day.scheduledDate),
          },
        });

        // Create WorkoutDay & Connect It to the Workout
        await prisma.workoutDay.create({
          data: {
            dayNumber: day.dayNumber,
            week: { connect: { id: createdWeek.id } },
            workout: { connect: { id: workout.id } },
          },
        });

        // Loop Through Exercises
        for (const exercise of day.exercises || []) {
          let existingExercise = await prisma.exercise.findUnique({
            where: { name: exercise.name },
          });

          // If Exercise Does Not Exist, Create It
          if (!existingExercise) {
            existingExercise = await prisma.exercise.create({
              data: {
                name: exercise.name,
                category: exercise.category,
              },
            });
          }

          // Create Workout Exercise Entry
          await prisma.workoutExercise.create({
            data: {
              workoutId: workout.id,
              exerciseId: existingExercise.id,
              sets: exercise.sets || 0,
              reps: exercise.reps || 0,
              weekNumber: i + 1,
              originalWeek: i + 1,
            },
          });
        }
      }
    }

    res
      .status(201)
      .json({ message: "Workout program created successfully", program });
  } catch (error) {
    console.error("Error creating workout program:", error);
    res.status(500).json({ error: "Failed to create workout program" });
  }
};

export const updateWorkoutExercise = async (req, res) => {
  const { exerciseId, weekNumber } = req.params;
  const { sets, reps, weightUsed } = req.body;

  try {
    const updatedExercise = await prisma.workoutExercise.updateMany({
      where: {
        exerciseId,
        weekNumber, // Only updates exercises for the specific week
      },
      data: {
        sets,
        reps,
        weightUsed,
      },
    });

    res.status(200).json(updatedExercise);
  } catch (error) {
    console.error("Error updating workout exercise:", error);
    res.status(500).json({ error: "Error updating exercise" });
  }
};

// Get Workout Program by ID
export const getWorkoutProgram = async (req, res) => {
  const { programId } = req.params;
  console.log(programId);

  try {
    const program = await prisma.workoutProgram.findUnique({
      where: { id: programId },
      include: {
        weeks: {
          include: {
            days: {
              include: {
                workout: {
                  include: {
                    workoutExercises: {
                      include: {
                        exercise: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    res.status(200).json(program);
  } catch (error) {
    console.error("Error fetching workout program:", error);
    res.status(500).json({ error: "Error fetching workout program" });
  }
};

// Update Workout Program by ID
export const updateWorkoutProgram = async (req, res) => {
  console.log(" Incoming request body:", JSON.stringify(req.body, null, 2));

  const { programId } = req.params;
  const { title, status, weeks, trainerId, clientId } = req.body;

  //  Validate Incoming Data
  if (!weeks || weeks.length === 0) {
    return res
      .status(400)
      .json({ error: "Weeks data is missing from request" });
  }

  for (const week of weeks) {
    if (!week.id || !week.weekNumber) {
      return res
        .status(400)
        .json({ error: `Week data is invalid: ${JSON.stringify(week)}` });
    }
    if (!week.days || week.days.length === 0) {
      return res
        .status(400)
        .json({ error: `Days are missing for week ${week.weekNumber}` });
    }
  }

  try {
    console.log(" Updating Workout Program:", { programId, title, status });

    //  Update the Workout Program
    const updatedProgram = await prisma.workoutProgram.update({
      where: { id: programId },
      data: { title, status },
    });

    for (const week of weeks) {
      console.log(" Updating Week:", {
        weekId: week.id,
        weekNumber: week.weekNumber,
      });

      //  Update or Create Week
      const updatedWeek = await prisma.workoutWeek.upsert({
        where: { id: week.id },
        update: { weekNumber: week.weekNumber },
        create: {
          weekNumber: week.weekNumber,
          program: { connect: { id: programId } },
        },
      });

      for (const day of week.days) {
        console.log(" Updating Day:", {
          dayId: day.id || "New Day",
          dayNumber: day.dayNumber,
          workoutId: day.workout?.id || "Missing Workout ID",
        });

        if (!day.workout) {
          console.error(" Missing workout for day:", day);
          continue;
        }

        //  Update or Create Workout
        const updatedWorkout = await prisma.workout.upsert({
          where: { id: day.workout.id || "" },
          update: {
            title: day.workout.title,
            scheduledDate: new Date(day.workout.scheduledDate),
          },
          create: {
            title: day.workout.title,
            scheduledDate: new Date(day.workout.scheduledDate),
            trainerId: trainerId,
            clientId: clientId,
          },
        });

        console.log(" Updated Workout:", {
          workoutId: updatedWorkout.id,
          title: updatedWorkout.title,
        });

        //  Connect Workout to WorkoutDay
        const updatedDay = await prisma.workoutDay.upsert({
          where: { id: day.id },
          update: {
            dayNumber: day.dayNumber,
            week: { connect: { id: updatedWeek.id } },
            workout: { connect: { id: updatedWorkout.id } },
          },
          create: {
            dayNumber: day.dayNumber,
            week: { connect: { id: updatedWeek.id } },
            workout: { connect: { id: updatedWorkout.id } },
          },
        });

        console.log(" Updated Workout Day:", {
          dayId: updatedDay.id,
          workoutId: updatedWorkout.id,
        });

        //  Loop through Exercises (Ensure Exercise is connected)
        for (const exercise of day.workout.workoutExercises || []) {
          console.log("Updating Exercise:", {
            exerciseId: exercise.exerciseId,
            sets: exercise.sets,
            reps: exercise.reps,
            weekNumber: week.weekNumber,
          });

          if (!exercise.exerciseId) {
            console.error("Missing exerciseId for:", exercise);
            continue;
          }

          //  Update or Create Workout Exercise
          await prisma.workoutExercise.upsert({
            where: { id: exercise.id || "" },
            update: {
              sets: exercise.sets,
              reps: exercise.reps,
              weekNumber: exercise.weekNumber,
              originalWeek: exercise.originalWeek || exercise.weekNumber, // Ensure value is always set
            },
            create: {
              workoutId: updatedWorkout.id,
              exerciseId: exercise.exerciseId,
              sets: exercise.sets,
              reps: exercise.reps,
              weekNumber: exercise.weekNumber,
              originalWeek: exercise.weekNumber, // Ensures originalWeek is always included
            },
          });
        }
      }
    }

    res.status(200).json({
      message: "Workout program updated successfully",
      updatedProgram,
    });
  } catch (error) {
    console.error(" Error updating workout program:", error);
    res.status(500).json({ error: "Error updating workout program" });
  }
};
