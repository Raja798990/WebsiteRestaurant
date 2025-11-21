import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Import all route modules
import reservationsRouter from "./routes/reservations.js";
import menuRouter from "./routes/menu.js";
import winesRouter from "./routes/wines.js";
import specialsRouter from "./routes/specials.js";
import requestsRouter from "./routes/requests.js";
import adminsRouter from "./routes/admins.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const resolvePath = (...segments) => path.join(__dirname, ...segments);

// Middleware
app.use(cors());
app.use(express.json());

// ==================== API ROUTES ====================
app.use("/api/reservations", reservationsRouter);
app.use("/api/menu", menuRouter);
app.use("/api/wines", winesRouter);
app.use("/api/specials", specialsRouter);
app.use("/api/requests", requestsRouter);
app.use("/api/admins", adminsRouter);

// ==================== STATIC FILES ====================
app.use(express.static(__dirname));
app.use("/Proposal", express.static(resolvePath("Proposal")));

// ==================== HTML ROUTES ====================
app.get("/", (req, res) => {
  res.sendFile(resolvePath("Index.html"));
});

app.get("/proposals", (req, res) => {
  res.sendFile(resolvePath("Proposal", "Gurdeep_Gursimransingh_proposals.html"));
});

// ==================== 404 HANDLER ====================
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📋 API endpoints:`);
  console.log(`   GET  /api/reservations`);
  console.log(`   GET  /api/menu`);
  console.log(`   GET  /api/wines`);
  console.log(`   GET  /api/specials`);
  console.log(`   POST /api/requests`);
  console.log(`   GET  /api/admins (protected)`);
});