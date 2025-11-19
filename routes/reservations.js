import { Router } from "express";
import prisma from "../prismaClient.js";

const router = Router();

// GET /api/reservations
router.get("/", async (req, res) => {
  try {
    const reservations = await prisma.reservation.findMany({
      orderBy: { createdAt: "desc" }
    });

    res.json(reservations);
  } catch (err) {
    console.error("Error fetching reservations:", err);
    res.status(500).json({ error: "Failed to load reservations" });
  }
});

// POST /api/reservations
router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      date,  // "2025-11-22"
      time,  // "19:30"
      adults,
      children,
      specialRemarks,
    } = req.body;

    if (!name || !email || !date || !time) {
      return res.status(400).json({
        success: false,
        message: "name, email, date and time are required",
      });
    }

    // Convert strings to Date objects that Prisma accepts
    const reservationDate = new Date(date); // expects YYYY-MM-DD
    // create a dummy date with the time
    const reservationTime = new Date(`1970-01-01T${time}:00`);

    const newReservation = await prisma.reservation.create({
      data: {
        name,
        email,
        reservationDate,
        reservationTime,
        adults: adults ?? 0,
        children: children ?? 0,
        specialRemarks: specialRemarks ?? null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Reservation created",
      data: newReservation,
    });

  } catch (err) {
    console.error("Error creating reservation:", err);
    res.status(500).json({ error: "Failed to create reservation" });
  }
});

export default router;
