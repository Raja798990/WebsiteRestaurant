import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import reservationsRouter from "./routes/reservations.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const resolvePath = (...segments) => path.join(__dirname, ...segments);

app.use(cors());
app.use(express.json());

// 1) API ROUTES FIRST
app.use("/api/reservations", reservationsRouter);

// 2) STATIC FILES AFTER
app.use(express.static(__dirname));
app.use("/Proposal", express.static(resolvePath("Proposal")));

app.get("/", (req, res) => {
  res.sendFile(resolvePath("Index.html"));
});

app.get("/proposals", (req, res) => {
  res.sendFile(resolvePath("Proposal", "Gurdeep_Gursimransingh_proposals.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
