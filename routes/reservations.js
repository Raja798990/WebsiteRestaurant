// routes/reservations.js
import { Router } from "express";

const router = Router();

// in-memory fake DB for now
let reservations = [];

// GET /api/reservations
router.get("/", (req, res) => {
  res.json(reservations);
});

// POST /api/reservations
router.post("/", (req, res) => {
  const {
    name,
    email,
    date,
    time,
    adults,
    children,
    specialRemarks,   // text box: birthday, allergy, terrace, etc.
  } = req.body;

  // basic validation
  if (!name || !email || !date || !time) {
    return res.status(400).json({
      success: false,
      message: "name, email, date and time are required",
    });
  }

  const newReservation = {
    id: reservations.length + 1,
    name,
    email,
    date,
    time,
    adults: adults ?? 0,
    children: children ?? 0,
    specialRemarks: specialRemarks ?? "",
    createdAt: new Date().toISOString(),
  };

  reservations.push(newReservation);

  return res.status(201).json({
    success: true,
    message: "Reservation created",
    data: newReservation,
  });
});

// later we can add PUT /:id, DELETE /:id, etc.

export default router;
