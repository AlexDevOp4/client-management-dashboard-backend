import { PrismaClient } from "@prisma/client";
import e from "express";
import { z } from "zod";
import { sendEmail } from "../services/mailer.js";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();
const { hash, compare } = bcrypt;

const generatePassword = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < 10; i++) {
    password += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return password;
};

// Define validation schema using Zod
const updateClientSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  age: z.number().int("Age must be a number").optional(),
  weight: z.number().optional(),
  bodyFat: z.number().optional(),
  progressPics: z.array(z.string()).optional(),
});

export const getClientById = async (req, res) => {
  const { id } = req.params;

  try {
    const clientProfile = await prisma.clientProfile.findUnique({
      where: { id },
    });

    if (!clientProfile) {
      return res.status(404).json({ error: "Client profile not found" });
    }

    res.status(200).json(clientProfile);
  } catch (error) {
    res.status(500).json({ error: "Error fetching client profile" });
  }
};

//? List all clients for a trainer
export const getClients = async (req, res) => {
  const { id } = req.params;

  try {
    const clients = await prisma.clientProfile.findMany({
      where: { trainerId: id },
    });

    const filteredClients = clients.map((client) => {
      return {
        id: client.id,
        name: client.name,
        age: client.age,
        weight: client.weight,
        bodyFat: client.bodyFat,
        progressPics: client.progressPics,
      };
    });

    if (!clients) {
      return res
        .status(404)
        .json({ error: "No clients found for this trainer" });
    }

    return res.status(200).json(filteredClients);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching clients" });
  }
};

const sendResetPassword = async (to, password) => {
  const subject = "Reset your password";
  const text = "Click the link to reset your password";
  const html = `<p>Click the link to reset your password</p><br/><br/> <p>Here is your temporary password: ${password}</p> <a href="http://localhost:3000/auth/reset-password">Reset Password</a>`;

  // Validate input
  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const info = await sendEmail(to, subject, text, html);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return error;
  }
};

//? Add a new client
export const addClient = async (req, res) => {
  const generatedPassword = generatePassword();
  const password = await hash(generatedPassword, 10);
  const { trainerId } = req.params;
  const { name, age, email, weight, bodyFat, progressPics } = req.body;

  // Validate the request body against the schema
  const validation = updateClientSchema.safeParse({
    name,
    age,
    weight,
    bodyFat,
    progressPics,
  });

  if (!validation.success) {
    return res.status(400).json({
      error: validation.error.errors.map((err) => err.message).join(", "),
    });
  }

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password,
        role: "client",
      },
    });

    const clientProfile = await prisma.clientProfile.create({
      data: {
        trainerId,
        userId: user.id,
        name,
        age,
        weight,
        bodyFat,
        progressPics,
      },
    });

    // Send email to the client with the generated password
    const emailResponse = await sendResetPassword(email, generatedPassword);
    if (!emailResponse || emailResponse.error) {
      return res.status(500).json({ error: "Error sending email" });
    }

    res.status(201).json({
      message: "Client created successfully.",
      clientProfile,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Error creating client profile" });
  }
};

export const updateClient = async (req, res) => {
  const { id } = req.params;
  const { name, age, weight, bodyFat, progressPics } = req.body;

  // Validate the request body against the schema
  const validation = updateClientSchema.safeParse({
    name,
    age,
    weight,
    bodyFat,
    progressPics,
  });

  if (!validation.success) {
    return res.status(400).json({
      error: validation.error.errors.map((err) => err.message).join(", "),
    });
  }

  try {
    const clientProfile = await prisma.clientProfile.update({
      where: { id },
      data: { name, age, weight, bodyFat, progressPics },
    });

    res.status(200).json(clientProfile);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Error updating client profile" });
  }
};

// View Clients workout history
export const viewClientWorkoutHistory = async (req, res) => {
  const { clientId } = req.params;

  try {
    const workouts = await prisma.workout.findMany({
      where: { clientId },
      include: {
        workoutExercises: { include: { exercise: true } },
        logs: true,
      },
    });

    if (workouts.length === 0) {
      return res
        .status(404)
        .json({ error: "No workouts found for this client" });
    }

    res.status(200).json(workouts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Error fetching workouts" });
  }
};
