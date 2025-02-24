import express from "express";

import { createWorkout, logExercise } from "../controllers/workoutController.js";

const router = express.Router();

router.post("/create", createWorkout);
router.post("/log", logExercise);

export default router;