import express from "express";

import { updatePassword, getUserById, findUser, deleteUser } from "../controllers/userController.js";

const router = express.Router();

router.get("/:id", getUserById);
router.post("/find", findUser);
router.post("/update-password", updatePassword);
router.delete("/delete/:id", deleteUser);

export default router;
