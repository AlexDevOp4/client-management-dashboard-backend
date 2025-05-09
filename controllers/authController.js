import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import express from "express";
import errorHandler from "../middlewares/errorHandler.js";

const { hash, compare } = bcrypt;
const { sign, verify } = jsonwebtoken;
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
const app = express();

app.use(errorHandler);

export const register = async (req, res) => {
  const { email, password, role, name } = req.body;
  if (!email || !password || !role || !name)
    return res.status(400).json({ error: "All fields are required" });

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!passwordRegex.test(password))
    return res.status(400).json({
      error:
        "Password must be at least 8 characters long, contain uppercase and lowercase letters, a number, and a special character.",
    });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email))
    return res.status(400).json({ error: "Invalid email format" });

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser)
    return res.status(400).json({ error: "User already exists" });

  if (role !== "client" && role !== "trainer")
    return res.status(400).json({ error: "Invalid role" });

  try {
    const hashedPassword = await hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        clientProfile: role === "client" ? { create: { name } } : undefined,
      },
    });

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Something went wrong. Please try again." + error });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isMatch = await compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

    const token = sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    // Send token in an httpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

// Logout front end cookies
export const logout = async (req, res) => {
  console.log("Logging out...");

  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });

  res.clearCookie("role", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/auth",
  });

  res.status(200).json({ message: "Logged out successfully" });
};

export const protect = async (req, res, next) => {
  console.log(req.user.id, "req.user");
  try {
    if (!req.user || !req.user.id)
      throw { statusCode: 401, message: "Unauthorized - No user in request" };

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) throw { statusCode: 404, message: "User not found" };

    res.json({ user: user });
  } catch (error) {
    next(error);
  }
};
