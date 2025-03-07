import express from "express";

import { createWorkout, logExercise, getExercises, createWorkoutProgram, updateWorkoutExercise, getWorkoutProgram, updateWorkoutProgram } from "../controllers/workoutController.js";

const router = express.Router();

router.get("/exercises", getExercises);
router.get("/program/:programId", getWorkoutProgram);
router.post("/program", createWorkoutProgram);
router.post("/create", createWorkout);
router.post("/log", logExercise);
router.put("/exercise/:exerciseId/:weekNumber", updateWorkoutExercise);
router.put("/program/:programId", updateWorkoutProgram);

export default router;