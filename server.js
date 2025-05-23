import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Middlewares and routes
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
  "http://localhost:3000", // Local dev
  "https://client-management-dashboard-psi.vercel.app", // Live frontend
];

// CORS config
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://client-management-dashboard-psi.vercel.app",
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Health check route (put before all other handlers)
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "Backend is live!" });
});

app.get("/api/test-cors", (req, res) => {
  res.json({ message: "CORS route works!" });
});

// Main API routes
app.use("/api/auth", authRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/trainer", trainerRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/user", userRoutes);
app.use("/api/workouts", workoutRoutes);

// 404 catch-all (put after all defined routes)
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler (should be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
