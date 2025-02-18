import express from "express";
import { getTrainersClients } from "../controllers/trainerController.js";

const router = express.Router();

router.get("/:trainerId", getTrainersClients);

export default router;