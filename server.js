import "dotenv/config";
import express, { json } from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
const { hash, compare } = bcrypt;
const { sign, verify } = jsonwebtoken;

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(json());

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

// 🔹 Register Route
app.post("/api/auth/register", async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const hashedPassword = await hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, role },
    });

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(400).json({ error: "User already exists!" });
  }
});

// 🔹 Login Route
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
});

// 🔹 Protected Route (Example)
app.get("/api/user/me", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
