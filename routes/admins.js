import { Router } from "express";
import prisma from "../prismaClient.js";
import authenticateAdmin from "../middleware/auth.js";
// NOTE: In production, you should use bcrypt for password hashing
// import bcrypt from "bcrypt";

const router = Router();

// Restrict admin management routes to authenticated admins
router.use(authenticateAdmin);

// Helper to hash password (simplified - use bcrypt in production!)
const hashPassword = (password) => {
  // TODO: Replace with bcrypt.hashSync(password, 10)
  return Buffer.from(password).toString("base64");
};

// Helper to verify password
const verifyPassword = (password, hash) => {
  // TODO: Replace with bcrypt.compareSync(password, hash)
  return Buffer.from(password).toString("base64") === hash;
};

// GET /api/admins - Get all admins (superadmin only)
router.get("/", async (req, res) => {
  try {
    const admins = await prisma.admin.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        // Never return password!
      },
    });

    res.json(admins);
  } catch (err) {
    console.error("Error fetching admins:", err);
    res.status(500).json({ error: "Failed to load admins" });
  }
});

// GET /api/admins/:id - Get single admin
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const admin = await prisma.admin.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json(admin);
  } catch (err) {
    console.error("Error fetching admin:", err);
    res.status(500).json({ error: "Failed to load admin" });
  }
});

// POST /api/admins - Create new admin (superadmin only)
router.post("/", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email, and password are required" });
    }

    // Check if email already exists
    const existing = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return res.status(400).json({ error: "An admin with this email already exists" });
    }

    const admin = await prisma.admin.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashPassword(password),
        role: role ?? "admin",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(201).json({ success: true, data: admin });
  } catch (err) {
    console.error("Error creating admin:", err);
    res.status(500).json({ error: "Failed to create admin" });
  }
});

// PUT /api/admins/:id - Update admin
router.put("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, email, role } = req.body;

    const admin = await prisma.admin.update({
      where: { id },
      data: {
        name,
        email: email ? email.toLowerCase() : undefined,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.json({ success: true, data: admin });
  } catch (err) {
    console.error("Error updating admin:", err);
    res.status(500).json({ error: "Failed to update admin" });
  }
});

// PUT /api/admins/:id/password - Change password
router.put("/:id/password", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "currentPassword and newPassword are required" });
    }

    // Get admin with password
    const admin = await prisma.admin.findUnique({ where: { id } });

    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    // Verify current password
    if (!verifyPassword(currentPassword, admin.password)) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Update password
    await prisma.admin.update({
      where: { id },
      data: { password: hashPassword(newPassword) },
    });

    res.json({ success: true, message: "Password updated successfully" });
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).json({ error: "Failed to change password" });
  }
});

// DELETE /api/admins/:id - Delete admin (superadmin only)
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.admin.delete({ where: { id } });

    res.json({ success: true, message: "Admin deleted" });
  } catch (err) {
    console.error("Error deleting admin:", err);
    res.status(500).json({ error: "Failed to delete admin" });
  }
});

// POST /api/admins/login - Admin login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const admin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!admin || !verifyPassword(password, admin.password)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // In production, generate a JWT token here
    res.json({
      success: true,
      message: "Login successful",
      data: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        // token: generateJWT(admin) - add later
      },
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

export default router;