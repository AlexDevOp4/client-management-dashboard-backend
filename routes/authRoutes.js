import express from "express";
import { register, login, protect, logout } from "../controllers/authController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/logout", logout);
router.post("/login", login);
router.get("/me", authMiddleware, protect);

export default router;
