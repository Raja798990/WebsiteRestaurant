import { Router } from "express";
import prisma from "../prismaClient.js";
import authenticateAdmin from "../middleware/auth.js";

const router = Router();

// Require admin authentication for reservation management
router.use(authenticateAdmin);

// DTO transformer
const toReservationDTO = (r) => ({
  id: r.id,
  name: r.name,
  email: r.email,
  date: r.reservationDate ? r.reservationDate.toISOString().split("T")[0] : null,
  time: r.reservationTime ? r.reservationTime.toISOString().substring(11, 16) : null,
  adults: r.adults,
  children: r.children,
  specialRemarks: r.specialRemarks,
  status: r.status,
  createdAt: r.createdAt,
});

// Helper to parse ID
const parseId = (rawId) => {
  const parsed = parseInt(rawId, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

// GET /api/reservations - Get all reservations (admin)
router.get("/", async (req, res) => {
  try {
    // Optional query params for filtering
    const { date, status } = req.query;

    const where = {};
    if (status) where.status = status;
    if (date) where.reservationDate = new Date(date);

    const reservations = await prisma.reservation.findMany({
      where,
      orderBy: [{ reservationDate: "desc" }, { reservationTime: "asc" }],
    });

    res.json(reservations.map(toReservationDTO));
  } catch (err) {
    console.error("Error fetching reservations:", err);
    res.status(500).json({ error: "Failed to load reservations" });
  }
});

// GET /api/reservations/today - Get today's reservations (admin dashboard)
router.get("/today", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const reservations = await prisma.reservation.findMany({
      where: {
        reservationDate: {
          gte: today,
          lt: tomorrow,
        },
      },
      orderBy: { reservationTime: "asc" },
    });

    res.json(reservations.map(toReservationDTO));
  } catch (err) {
    console.error("Error fetching today's reservations:", err);
    res.status(500).json({ error: "Failed to load reservations" });
  }
});

// GET /api/reservations/:id - Get single reservation
router.get("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "Invalid reservation id" });
  }

  try {
    const reservation = await prisma.reservation.findUnique({ where: { id } });

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    res.json(toReservationDTO(reservation));
  } catch (err) {
    console.error("Error fetching reservation:", err);
    res.status(500).json({ error: "Failed to load reservation" });
  }
});

// POST /api/reservations - Create reservation (admin-managed)
router.post("/", async (req, res) => {
  try {
    const { name, email, date, time, adults, children, specialRemarks } = req.body;

    // Validation
    if (!name || !email || !date || !time) {
      return res.status(400).json({
        success: false,
        error: "name, email, date and time are required",
      });
    }

    // Check if email is banned
    const banned = await prisma.bannedCustomer.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (banned) {
      return res.status(403).json({
        success: false,
        error: "This email address has been blocked from making reservations",
      });
    }

    const reservationDate = new Date(date);
    const reservationTime = new Date(`1970-01-01T${time}:00`);

    const newReservation = await prisma.reservation.create({
      data: {
        name,
        email: email.toLowerCase(),
        reservationDate,
        reservationTime,
        adults: adults ?? 1,
        children: children ?? 0,
        specialRemarks: specialRemarks ?? null,
        status: "pending",
      },
    });

    res.status(201).json({
      success: true,
      message: "Reservation created successfully",
      data: toReservationDTO(newReservation),
    });
  } catch (err) {
    console.error("Error creating reservation:", err);
    res.status(500).json({ error: "Failed to create reservation" });
  }
});

// PUT /api/reservations/:id - Update reservation (admin)
router.put("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "Invalid reservation id" });
  }

  try {
    const { name, email, date, time, adults, children, specialRemarks, status } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (date) updateData.reservationDate = new Date(date);
    if (time) updateData.reservationTime = new Date(`1970-01-01T${time}:00`);
    if (adults !== undefined) updateData.adults = adults;
    if (children !== undefined) updateData.children = children;
    if (specialRemarks !== undefined) updateData.specialRemarks = specialRemarks;
    if (status) updateData.status = status;

    const reservation = await prisma.reservation.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      message: "Reservation updated",
      data: toReservationDTO(reservation),
    });
  } catch (err) {
    console.error("Error updating reservation:", err);
    res.status(500).json({ error: "Failed to update reservation" });
  }
});

// PATCH /api/reservations/:id/status - Quick status update (admin)
router.patch("/:id/status", async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "Invalid reservation id" });
  }

  try {
    const { status } = req.body;

    if (!["pending", "confirmed", "declined", "cancelled"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const reservation = await prisma.reservation.update({
      where: { id },
      data: { status },
    });

    res.json({
      success: true,
      message: `Reservation ${status}`,
      data: toReservationDTO(reservation),
    });
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

// DELETE /api/reservations/:id - Delete reservation (admin)
router.delete("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(400).json({ error: "Invalid reservation id" });
  }

  try {
    await prisma.reservation.delete({ where: { id } });

    res.json({ success: true, message: "Reservation deleted" });
  } catch (err) {
    console.error("Error deleting reservation:", err);
    res.status(500).json({ error: "Failed to delete reservation" });
  }
});

export default router;