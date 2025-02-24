import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getTrainersClients = async (req, res) => {
  const { userId } = req.params;

  try {
    const clients = await prisma.clientProfile.findMany({
      where: { userId },
    });

    if (!clients) {
      return res
        .status(404)
        .json({ error: "No clients found for this trainer" });
    }

    res.status(200).json(clients);
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: "Error fetching clients" });
  }
};