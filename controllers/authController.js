import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
import express, { json } from "express";
import errorHandler from "../middlewares/errorHandler.js";

const { hash, compare } = bcrypt;
const { sign, verify } = jsonwebtoken;
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
const app = express();

app.use(errorHandler);

export const register = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const hashedPassword = await hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, role },
    });

    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    next(error);
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

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    next(error);
  }
};

export const protect = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id)
      throw { statusCode: 401, message: "Unauthorized - No user in request" };

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) throw { statusCode: 404, message: "User not found" };

    res.json({ user });
  } catch (error) {
    next(error);
  }
};
