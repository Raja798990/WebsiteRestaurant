import { Router } from "express";
import prisma from "../prismaClient.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// GET /api/menu - Get all categories with their items
router.get("/", async (req, res) => {
  try {
    const categories = await prisma.menuCategory.findMany({
      orderBy: { order: "asc" },
      include: {
        items: {
          where: { available: true },
          orderBy: { name: "asc" },
        },
      },
    });

    // Transform for frontend
    const menu = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      note: cat.note,
      items: cat.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: parseFloat(item.price),
      })),
    }));

    res.json(menu);
  } catch (err) {
    console.error("Error fetching menu:", err);
    res.status(500).json({ error: "Failed to load menu" });
  }
});

// Protect admin menu routes
router.use(requireAuth);

// GET /api/menu/categories - Get all categories (admin)
router.get("/categories", async (req, res) => {
  try {
    const categories = await prisma.menuCategory.findMany({
      orderBy: { order: "asc" },
    });
    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ error: "Failed to load categories" });
  }
});

// POST /api/menu/categories - Create category (admin)
router.post("/categories", requireRole("admin", "superadmin"), async (req, res) => {
  try {
    const { name, order, note } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Category name is required" });
    }

    const category = await prisma.menuCategory.create({
      data: { name, order: order ?? 0, note: note ?? null },
    });

    res.status(201).json({ success: true, data: category });
  } catch (err) {
    console.error("Error creating category:", err);
    res.status(500).json({ error: "Failed to create category" });
  }
});

// PUT /api/menu/categories/:id - Update category (admin)
router.put("/categories/:id", requireRole("admin", "superadmin"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, order, note } = req.body;

    const category = await prisma.menuCategory.update({
      where: { id },
      data: { name, order, note },
    });

    res.json({ success: true, data: category });
  } catch (err) {
    console.error("Error updating category:", err);
    res.status(500).json({ error: "Failed to update category" });
  }
});

// DELETE /api/menu/categories/:id - Delete category (admin)
router.delete("/categories/:id", requireRole("admin", "superadmin"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.menuCategory.delete({ where: { id } });

    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    console.error("Error deleting category:", err);
    res.status(500).json({ error: "Failed to delete category" });
  }
});

// GET /api/menu/items - Get all items (admin)
router.get("/items", async (req, res) => {
  try {
    const items = await prisma.menuItem.findMany({
      include: { category: true },
      orderBy: { name: "asc" },
    });

    res.json(items.map((item) => ({
      id: item.id,
      categoryId: item.categoryId,
      categoryName: item.category.name,
      name: item.name,
      price: parseFloat(item.price),
      available: item.available,
    })));
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ error: "Failed to load items" });
  }
});

// POST /api/menu/items - Create menu item (admin)
router.post("/items", requireRole("admin", "superadmin"), async (req, res) => {
  try {
    const { categoryId, name, price } = req.body;

    if (!categoryId || !name || price === undefined) {
      return res.status(400).json({ error: "categoryId, name, and price are required" });
    }

    const item = await prisma.menuItem.create({
      data: {
        categoryId: parseInt(categoryId),
        name,
        price: parseFloat(price),
      },
    });

    res.status(201).json({ success: true, data: item });
  } catch (err) {
    console.error("Error creating item:", err);
    res.status(500).json({ error: "Failed to create item" });
  }
});

// PUT /api/menu/items/:id - Update menu item (admin)
router.put("/items/:id", requireRole("admin", "superadmin"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { categoryId, name, price, available } = req.body;

    const item = await prisma.menuItem.update({
      where: { id },
      data: {
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        name,
        price: price !== undefined ? parseFloat(price) : undefined,
        available,
      },
    });

    res.json({ success: true, data: item });
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).json({ error: "Failed to update item" });
  }
});

// DELETE /api/menu/items/:id - Delete menu item (admin)
router.delete("/items/:id", requireRole("admin", "superadmin"), async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.menuItem.delete({ where: { id } });

    res.json({ success: true, message: "Item deleted" });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ error: "Failed to delete item" });
  }
});

export default router;
