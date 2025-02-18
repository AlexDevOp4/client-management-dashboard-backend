import express from "express";

import { updatePassword, getUserById, deleteUser } from "../controllers/userController.js";

const router = express.Router();

router.get("/:id", getUserById);
router.post("/update-password", updatePassword);
router.delete("/delete/:id", deleteUser);

export default router;
