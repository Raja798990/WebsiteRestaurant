import { Router } from "express";
import prisma from "../prismaClient.js";
import authenticateAdmin from "../middleware/auth.js";

const router = Router();

// Restrict wine routes to authenticated admins
router.use(authenticateAdmin);

// Transform wine data for API response
const transformWine = (wine) => {
  const transformed = {
    id: wine.id,
    name: wine.name,
    country: wine.country,
  };

  // House wines (pitcher format)
  if (wine.glassPrice || wine.pitcher25cl || wine.pitcher50cl || wine.pitcher1l) {
    transformed.pricing = {
      type: "house",
      glass: wine.glassPrice ? parseFloat(wine.glassPrice) : null,
      pitcher25cl: wine.pitcher25cl ? parseFloat(wine.pitcher25cl) : null,
      pitcher50cl: wine.pitcher50cl ? parseFloat(wine.pitcher50cl) : null,
      pitcher1l: wine.pitcher1l ? parseFloat(wine.pitcher1l) : null,
    };
  }
  // Premium wines (bottle format)
  else {
    transformed.pricing = {
      type: "premium",
      halfBottle: wine.halfBottle ? parseFloat(wine.halfBottle) : null,
      fullBottle: wine.fullBottle ? parseFloat(wine.fullBottle) : null,
    };
  }

  return transformed;
};

// GET /api/wines - Get all wines organized by category (public)
router.get("/", async (req, res) => {
  try {
    const categories = await prisma.wineCategory.findMany({
      orderBy: { order: "asc" },
      include: {
        wines: {
          where: { available: true },
          orderBy: [{ country: "asc" }, { name: "asc" }],
        },
      },
    });

    const wineList = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      nameEn: cat.nameEn,
      wines: cat.wines.map(transformWine),
    }));

    res.json(wineList);
  } catch (err) {
    console.error("Error fetching wines:", err);
    res.status(500).json({ error: "Failed to load wines" });
  }
});

// GET /api/wines/categories - Get all wine categories (admin)
router.get("/categories", async (req, res) => {
  try {
    const categories = await prisma.wineCategory.findMany({
      orderBy: { order: "asc" },
    });
    res.json(categories);
  } catch (err) {
    console.error("Error fetching wine categories:", err);
    res.status(500).json({ error: "Failed to load wine categories" });
  }
});

// POST /api/wines/categories - Create wine category (admin)
router.post("/categories", async (req, res) => {
  try {
    const { name, nameEn, order } = req.body;

    if (!name || !nameEn) {
      return res.status(400).json({ error: "name and nameEn are required" });
    }

    const category = await prisma.wineCategory.create({
      data: { name, nameEn, order: order ?? 0 },
    });

    res.status(201).json({ success: true, data: category });
  } catch (err) {
    console.error("Error creating wine category:", err);
    res.status(500).json({ error: "Failed to create wine category" });
  }
});

// GET /api/wines/items - Get all wines (admin)
router.get("/items", async (req, res) => {
  try {
    const wines = await prisma.wine.findMany({
      include: { category: true },
      orderBy: [{ category: { order: "asc" } }, { country: "asc" }, { name: "asc" }],
    });

    res.json(wines.map((w) => ({
      id: w.id,
      categoryId: w.categoryId,
      categoryName: w.category.name,
      name: w.name,
      country: w.country,
      glassPrice: w.glassPrice ? parseFloat(w.glassPrice) : null,
      pitcher25cl: w.pitcher25cl ? parseFloat(w.pitcher25cl) : null,
      pitcher50cl: w.pitcher50cl ? parseFloat(w.pitcher50cl) : null,
      pitcher1l: w.pitcher1l ? parseFloat(w.pitcher1l) : null,
      halfBottle: w.halfBottle ? parseFloat(w.halfBottle) : null,
      fullBottle: w.fullBottle ? parseFloat(w.fullBottle) : null,
      available: w.available,
    })));
  } catch (err) {
    console.error("Error fetching wines:", err);
    res.status(500).json({ error: "Failed to load wines" });
  }
});

// POST /api/wines/items - Create wine (admin)
router.post("/items", async (req, res) => {
  try {
    const { 
      categoryId, 
      name, 
      country,
      glassPrice,
      pitcher25cl,
      pitcher50cl,
      pitcher1l,
      halfBottle,
      fullBottle
    } = req.body;

    if (!categoryId || !name) {
      return res.status(400).json({ error: "categoryId and name are required" });
    }

    const wine = await prisma.wine.create({
      data: {
        categoryId: parseInt(categoryId),
        name,
        country: country || null,
        glassPrice: glassPrice ? parseFloat(glassPrice) : null,
        pitcher25cl: pitcher25cl ? parseFloat(pitcher25cl) : null,
        pitcher50cl: pitcher50cl ? parseFloat(pitcher50cl) : null,
        pitcher1l: pitcher1l ? parseFloat(pitcher1l) : null,
        halfBottle: halfBottle ? parseFloat(halfBottle) : null,
        fullBottle: fullBottle ? parseFloat(fullBottle) : null,
      },
    });

    res.status(201).json({ success: true, data: wine });
  } catch (err) {
    console.error("Error creating wine:", err);
    res.status(500).json({ error: "Failed to create wine" });
  }
});

// PUT /api/wines/items/:id - Update wine (admin)
router.put("/items/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { 
      categoryId, 
      name, 
      country,
      glassPrice,
      pitcher25cl,
      pitcher50cl,
      pitcher1l,
      halfBottle,
      fullBottle,
      available 
    } = req.body;

    const updateData = {};
    if (categoryId !== undefined) updateData.categoryId = parseInt(categoryId);
    if (name !== undefined) updateData.name = name;
    if (country !== undefined) updateData.country = country || null;
    if (glassPrice !== undefined) updateData.glassPrice = glassPrice ? parseFloat(glassPrice) : null;
    if (pitcher25cl !== undefined) updateData.pitcher25cl = pitcher25cl ? parseFloat(pitcher25cl) : null;
    if (pitcher50cl !== undefined) updateData.pitcher50cl = pitcher50cl ? parseFloat(pitcher50cl) : null;
    if (pitcher1l !== undefined) updateData.pitcher1l = pitcher1l ? parseFloat(pitcher1l) : null;
    if (halfBottle !== undefined) updateData.halfBottle = halfBottle ? parseFloat(halfBottle) : null;
    if (fullBottle !== undefined) updateData.fullBottle = fullBottle ? parseFloat(fullBottle) : null;
    if (available !== undefined) updateData.available = available;

    const wine = await prisma.wine.update({
      where: { id },
      data: updateData,
    });

    res.json({ success: true, data: wine });
  } catch (err) {
    console.error("Error updating wine:", err);
    res.status(500).json({ error: "Failed to update wine" });
  }
});

// DELETE /api/wines/items/:id - Delete wine (admin)
router.delete("/items/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.wine.delete({ where: { id } });
    res.json({ success: true, message: "Wine deleted" });
  } catch (err) {
    console.error("Error deleting wine:", err);
    res.status(500).json({ error: "Failed to delete wine" });
  }
});

export default router;