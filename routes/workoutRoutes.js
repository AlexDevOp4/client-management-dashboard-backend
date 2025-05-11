import express from "express";

import { createWorkout,updateWorkoutProgramStatus, getWorkoutLogsByWorkoutId, logExercise, getExercises, createWorkoutProgram, updateWorkoutExercise, getWorkoutProgram, updateWorkoutProgram, deleteWorkoutExercise, getWorkoutLog } from "../controllers/workoutController.js";

const router = express.Router();

router.get("/exercises", getExercises);
router.get("/log/:workoutId", getWorkoutLogsByWorkoutId);
router.get("/log/:workoutId", getWorkoutLog);
router.get("/program/:programId", getWorkoutProgram);
router.post("/program", createWorkoutProgram);
router.post("/create", createWorkout);
router.post("/log", logExercise);
router.put("/exercise/:exerciseId/:weekNumber", updateWorkoutExercise);
router.put("/program/:programId", updateWorkoutProgram);
router.put("/program/status/:programId", updateWorkoutProgramStatus);
router.delete("/exercise/:exerciseId", deleteWorkoutExercise);

export default router;