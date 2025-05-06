import express from "express";
import {
  getClients,
  getClientById,
  updateClient,
  addClient,
  viewClientWorkoutHistory,
  viewClientPrograms,
  getClientsExerciseProgress,
  getClientsProgress,
} from "../controllers/clientController.js";

const router = express.Router();

router.get("/:id", getClients);
router.get("/history/:clientId", viewClientWorkoutHistory);
router.get("/programs/:clientId", viewClientPrograms);
router.get(
  "/exerciseProgress/:clientId/exercise/:exerciseId",
  getClientsExerciseProgress
);
router.get("/:clientId/progress", getClientsProgress);
router.post("/:trainerId", addClient);
router.put("/:id", updateClient);

export default router;
