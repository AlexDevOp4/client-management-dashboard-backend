import express from "express";
import {
  getTrainersClients,
  trainerViewClientWorkoutHistory,
  getExerciseProgress,
} from "../controllers/trainerController.js";

const router = express.Router();

router.get("/:trainerId", getTrainersClients);
router.get(
  "/:trainerId/clients/:clientId/workouts",
  trainerViewClientWorkoutHistory
);
router.get(
  "/:trainerId/clients/:clientId/exercises/:exerciseId/progress",
  getExerciseProgress
);

export default router;
