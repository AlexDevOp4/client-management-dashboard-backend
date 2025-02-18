import express from "express";
import { sendEmail } from "../services/mailer.js";

const router = express.Router();

router.post("/send", async (req, res) => {
  const { to, subject, text, html } = req.body;

  // Validate input
  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    const info = await sendEmail(to, subject, text, html);
    res.status(200).json({ message: "Email sent successfully!", info });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    res.status(500).json({ error: "Failed to send email." });
  }
});

export default router;
