import express from "express";
import {
  getClients,
  getClientById,
  updateClient,
  addClient,
} from "../controllers/clientController.js";

const router = express.Router();

router.get("/:id", getClients);
router.post("/:trainerId", addClient);
router.put("/:id", updateClient);

export default router;
