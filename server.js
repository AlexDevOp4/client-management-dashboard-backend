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
const PORT = process.env.PORT || 8080;
const allowedOrigins = [
  "http://localhost:3000",
  "https://client-management-dashboard-frontend.vercel.app", // Replace with your real Vercel frontend domain
  "https://client-management-dashboard-backend-production.up.railway.app", // This is NOT your frontend; keep only if needed for server-to-server
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/trainer", trainerRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/user", userRoutes);
app.use("/api/workouts", workoutRoutes);
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "Backend is live!" });
});

app.use(errorHandler);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
