import express from "express";
import {
  getClients,
  getClientById,
  updateClient,
  addClient,
  viewClientWorkoutHistory,
  viewClientPrograms
} from "../controllers/clientController.js";

const router = express.Router();

router.get("/:id", getClients);
router.get("/history/:clientId", viewClientWorkoutHistory);
router.get("/programs/:clientId", viewClientPrograms);
router.post("/:trainerId", addClient);
router.put("/:id", updateClient);


export default router;
