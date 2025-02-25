import express from "express";
import {
  getTrainersClients,
  trainerViewClientWorkoutHistory,
  getExerciseProgress,
  filterProgress
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
router.get(
  "/:trainerId/clients/:clientId/exercises/:exerciseId/filter",
  filterProgress
);

export default router;
