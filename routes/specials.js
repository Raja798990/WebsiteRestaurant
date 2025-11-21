import { Router } from "express";
import prisma from "../prismaClient.js";
import authenticateAdmin from "../middleware/auth.js";

const router = Router();

// Guard specials routes with admin authentication
router.use(authenticateAdmin);

// GET /api/specials - Get all specials (public)
router.get("/", async (req, res) => {
  try {
    const [combos, mains, customs] = await Promise.all([
      prisma.specialCombo.findMany({ where: { available: true }, orderBy: { name: "asc" } }),
      prisma.specialMain.findMany({ where: { available: true }, orderBy: { name: "asc" } }),
      prisma.specialCustom.findMany({ where: { available: true }, orderBy: { name: "asc" } }),
    ]);

    res.json({
      startersWithTwoPrices: combos.map((c) => ({
        id: c.id,
        name: c.name,
        entreePrice: parseFloat(c.entreePrice),
        fullPrice: parseFloat(c.fullPrice),
      })),
      mainDishes: mains.map((m) => ({
        id: m.id,
        name: m.name,
        price: parseFloat(m.price),
      })),
      customItems: customs.map((c) => ({
        id: c.id,
        name: c.name,
        description: c.description,
        price: parseFloat(c.price),
      })),
    });
  } catch (err) {
    console.error("Error fetching specials:", err);
    res.status(500).json({ error: "Failed to load specials" });
  }
});

// ==================== COMBOS (Entrée + Plat) ====================

// GET /api/specials/combos - Get all combos (admin)
router.get("/combos", async (req, res) => {
  try {
    const combos = await prisma.specialCombo.findMany({ orderBy: { name: "asc" } });
    res.json(combos.map((c) => ({
      id: c.id,
      name: c.name,
      entreePrice: parseFloat(c.entreePrice),
      fullPrice: parseFloat(c.fullPrice),
      available: c.available,
    })));
  } catch (err) {
    console.error("Error fetching combos:", err);
    res.status(500).json({ error: "Failed to load combos" });
  }
});

// POST /api/specials/combos - Create combo (admin)
router.post("/combos", async (req, res) => {
  try {
    const { name, entreePrice, fullPrice } = req.body;

    if (!name || entreePrice === undefined || fullPrice === undefined) {
      return res.status(400).json({ error: "name, entreePrice, and fullPrice are required" });
    }

    const combo = await prisma.specialCombo.create({
      data: {
        name,
        entreePrice: parseFloat(entreePrice),
        fullPrice: parseFloat(fullPrice),
      },
    });

    res.status(201).json({ success: true, data: combo });
  } catch (err) {
    console.error("Error creating combo:", err);
    res.status(500).json({ error: "Failed to create combo" });
  }
});

// PUT /api/specials/combos/:id - Update combo (admin)
router.put("/combos/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, entreePrice, fullPrice, available } = req.body;

    const combo = await prisma.specialCombo.update({
      where: { id },
      data: {
        name,
        entreePrice: entreePrice !== undefined ? parseFloat(entreePrice) : undefined,
        fullPrice: fullPrice !== undefined ? parseFloat(fullPrice) : undefined,
        available,
      },
    });

    res.json({ success: true, data: combo });
  } catch (err) {
    console.error("Error updating combo:", err);
    res.status(500).json({ error: "Failed to update combo" });
  }
});

// DELETE /api/specials/combos/:id - Delete combo (admin)
router.delete("/combos/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.specialCombo.delete({ where: { id } });
    res.json({ success: true, message: "Combo deleted" });
  } catch (err) {
    console.error("Error deleting combo:", err);
    res.status(500).json({ error: "Failed to delete combo" });
  }
});

// ==================== MAINS (Single price) ====================

// GET /api/specials/mains - Get all mains (admin)
router.get("/mains", async (req, res) => {
  try {
    const mains = await prisma.specialMain.findMany({ orderBy: { name: "asc" } });
    res.json(mains.map((m) => ({
      id: m.id,
      name: m.name,
      price: parseFloat(m.price),
      available: m.available,
    })));
  } catch (err) {
    console.error("Error fetching mains:", err);
    res.status(500).json({ error: "Failed to load mains" });
  }
});

// POST /api/specials/mains - Create main (admin)
router.post("/mains", async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: "name and price are required" });
    }

    const main = await prisma.specialMain.create({
      data: { name, price: parseFloat(price) },
    });

    res.status(201).json({ success: true, data: main });
  } catch (err) {
    console.error("Error creating main:", err);
    res.status(500).json({ error: "Failed to create main" });
  }
});

// PUT /api/specials/mains/:id - Update main (admin)
router.put("/mains/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, price, available } = req.body;

    const main = await prisma.specialMain.update({
      where: { id },
      data: {
        name,
        price: price !== undefined ? parseFloat(price) : undefined,
        available,
      },
    });

    res.json({ success: true, data: main });
  } catch (err) {
    console.error("Error updating main:", err);
    res.status(500).json({ error: "Failed to update main" });
  }
});

// DELETE /api/specials/mains/:id - Delete main (admin)
router.delete("/mains/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.specialMain.delete({ where: { id } });
    res.json({ success: true, message: "Main deleted" });
  } catch (err) {
    console.error("Error deleting main:", err);
    res.status(500).json({ error: "Failed to delete main" });
  }
});

// ==================== CUSTOMS (Flexible items) ====================

// GET /api/specials/customs - Get all customs (admin)
router.get("/customs", async (req, res) => {
  try {
    const customs = await prisma.specialCustom.findMany({ orderBy: { name: "asc" } });
    res.json(customs.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      price: parseFloat(c.price),
      available: c.available,
    })));
  } catch (err) {
    console.error("Error fetching customs:", err);
    res.status(500).json({ error: "Failed to load customs" });
  }
});

// POST /api/specials/customs - Create custom (admin)
router.post("/customs", async (req, res) => {
  try {
    const { name, description, price } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: "name and price are required" });
    }

    const custom = await prisma.specialCustom.create({
      data: { name, description: description ?? null, price: parseFloat(price) },
    });

    res.status(201).json({ success: true, data: custom });
  } catch (err) {
    console.error("Error creating custom:", err);
    res.status(500).json({ error: "Failed to create custom" });
  }
});

// PUT /api/specials/customs/:id - Update custom (admin)
router.put("/customs/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description, price, available } = req.body;

    const custom = await prisma.specialCustom.update({
      where: { id },
      data: {
        name,
        description,
        price: price !== undefined ? parseFloat(price) : undefined,
        available,
      },
    });

    res.json({ success: true, data: custom });
  } catch (err) {
    console.error("Error updating custom:", err);
    res.status(500).json({ error: "Failed to update custom" });
  }
});

// DELETE /api/specials/customs/:id - Delete custom (admin)
router.delete("/customs/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.specialCustom.delete({ where: { id } });
    res.json({ success: true, message: "Custom item deleted" });
  } catch (err) {
    console.error("Error deleting custom:", err);
    res.status(500).json({ error: "Failed to delete custom" });
  }
});

export default router;