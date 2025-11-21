import { Router } from "express";
import prisma from "../prismaClient.js";

const router = Router();

// GET /api/requests - Get all contact requests (admin)
router.get("/", async (req, res) => {
  try {
    const requests = await prisma.request.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(requests.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      message: r.message,
      createdAt: r.createdAt,
    })));
  } catch (err) {
    console.error("Error fetching requests:", err);
    res.status(500).json({ error: "Failed to load requests" });
  }
});

// GET /api/requests/:id - Get single request (admin)
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const request = await prisma.request.findUnique({ where: { id } });

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    res.json({
      id: request.id,
      name: request.name,
      email: request.email,
      phone: request.phone,
      message: request.message,
      createdAt: request.createdAt,
    });
  } catch (err) {
    console.error("Error fetching request:", err);
    res.status(500).json({ error: "Failed to load request" });
  }
});

// POST /api/requests - Create contact request (public - from contact form)
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: "name, email, and message are required",
      });
    }

    // Check if email is banned
    const banned = await prisma.bannedCustomer.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (banned) {
      return res.status(403).json({
        success: false,
        error: "This email address has been blocked from contacting us",
      });
    }

    const request = await prisma.request.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone: phone ?? null,
        message,
      },
    });

    res.status(201).json({
      success: true,
      message: "Your message has been sent successfully",
      data: { id: request.id },
    });
  } catch (err) {
    console.error("Error creating request:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// DELETE /api/requests/:id - Delete request (admin)
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.request.delete({ where: { id } });

    res.json({ success: true, message: "Request deleted" });
  } catch (err) {
    console.error("Error deleting request:", err);
    res.status(500).json({ error: "Failed to delete request" });
  }
});

// ==================== BANNED CUSTOMERS ====================

// GET /api/requests/banned/list - Get all banned customers (admin)
router.get("/banned/list", async (req, res) => {
  try {
    const banned = await prisma.bannedCustomer.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(banned);
  } catch (err) {
    console.error("Error fetching banned customers:", err);
    res.status(500).json({ error: "Failed to load banned customers" });
  }
});

// POST /api/requests/banned - Ban a customer (admin)
router.post("/banned", async (req, res) => {
  try {
    const { email, reason } = req.body;

    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }

    const banned = await prisma.bannedCustomer.create({
      data: {
        email: email.toLowerCase(),
        reason: reason ?? null,
      },
    });

    res.status(201).json({ success: true, data: banned });
  } catch (err) {
    // Handle duplicate email error
    if (err.code === "P2002") {
      return res.status(400).json({ error: "This email is already banned" });
    }
    console.error("Error banning customer:", err);
    res.status(500).json({ error: "Failed to ban customer" });
  }
});

// DELETE /api/requests/banned/:id - Unban a customer (admin)
router.delete("/banned/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.bannedCustomer.delete({ where: { id } });

    res.json({ success: true, message: "Customer unbanned" });
  } catch (err) {
    console.error("Error unbanning customer:", err);
    res.status(500).json({ error: "Failed to unban customer" });
  }
});

export default router;