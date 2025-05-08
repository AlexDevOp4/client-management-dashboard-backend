import "dotenv/config";
import express, { json } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import errorHandler from "./middlewares/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import trainerRoutes from "./routes/trainerRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import workoutRoutes from "./routes/workoutRoutes.js";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://client-management-dashboard-backend-production.up.railway.app", // replace with actual domain after deploy
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(errorHandler);

app.use("/api/auth", authRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/trainer", trainerRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/user", userRoutes);
app.use("/api/workouts", workoutRoutes);

const PORT = process.env.PORT || 8080;

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "Backend is live!" });
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
