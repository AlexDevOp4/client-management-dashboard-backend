import express from "express";

import { createWorkout, logExercise, getExercises } from "../controllers/workoutController.js";

const router = express.Router();

router.get("/exercises", getExercises);
router.post("/create", createWorkout);
router.post("/log", logExercise);

export default router;