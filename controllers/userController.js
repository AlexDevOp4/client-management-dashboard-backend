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

// Update Users password

export const updatePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  if (!email || !oldPassword || !newPassword)
    return res.status(400).json({ error: "All fields are required" });

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!passwordRegex.test(newPassword))
    return res.status(400).json({
      error:
        "Password must be at least 8 characters long, contain uppercase and lowercase letters, a number, and a special character.",
    });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const hashedPassword = await hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Something went wrong. Please try again." + error });
  }
};

// Delete User and ClientProfile at the same time
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.clientProfile.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });

    res.status(200).json({ message: "User deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting user" });
  }
};

// Get User by ID and if the user is a trainer, get the clients associated with the trainer
export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { clientProfile: true, clients: true },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      clientProfile: user.clientProfile,
      clients: user.clients.map((client) => ({
        id: client.id,
        userId: client.userId,
        name: client.name,
        email: client.email,
        age: client.age,
        weight: client.weight,
        bodyFat: client.bodyFat,
      })),
    };

    res.status(200).json(userData);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user" });
  }
};
