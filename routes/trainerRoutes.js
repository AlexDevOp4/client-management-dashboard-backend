import express from "express";
import { getTrainersClients, trainerViewClientWorkoutHistory } from "../controllers/trainerController.js";

const router = express.Router();

router.get("/:trainerId", getTrainersClients);
router.get("/:trainerId/clients/:clientId/workouts", trainerViewClientWorkoutHistory);

export default router;