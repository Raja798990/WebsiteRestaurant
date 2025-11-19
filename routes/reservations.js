import { Router } from "express";
import prisma from "../prismaClient.js";

const router = Router();

const toReservationDTO = (reservation) => ({
  id: reservation.id,
  name: reservation.name,
  email: reservation.email,
  date: reservation.reservationDate
    ? reservation.reservationDate.toISOString().split("T")[0]
    : null,
  time: reservation.reservationTime
    ? reservation.reservationTime.toISOString().substring(11, 16)
    : null,
  adults: reservation.adults,
  children: reservation.children,
  specialRemarks: reservation.specialRemarks,
  createdAt: reservation.createdAt,
});

console.log("✅ reservations router file loaded");

// GET /api/reservations -> all reservations
router.get("/", async (req, res) => {
  try {
    const reservations = await prisma.reservation.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(reservations.map(toReservationDTO));
  } catch (err) {
    console.error("Error fetching reservations:", err);
    res.status(500).json({ error: "Failed to load reservations" });
  }
});

// GET /api/reservations/:id -> single reservation
router.get("/:id", async (req, res) => {
  console.log("🔎 /api/reservations/:id hit with", req.params);

  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "Invalid reservation id" });
  }

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      console.warn(`Reservation ${id} not found`);
      return res.status(404).json({ error: "Reservation not found" });
    }

    res.json(toReservationDTO(reservation));
  } catch (err) {
    console.error("Error fetching reservation:", err);
    res.status(500).json({ error: "Failed to load reservation" });
  }
});

// POST /api/reservations -> create reservation
router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      date,   // "2025-11-25"
      time,   // "19:30"
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

    const reservationDate = new Date(date);                  // YYYY-MM-DD
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
      data: toReservationDTO(newReservation),
    });
  } catch (err) {
    console.error("Error creating reservation:", err);
    res.status(500).json({ error: "Failed to create reservation" });
  }
});

export default router;
