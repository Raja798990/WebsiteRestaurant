import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// Resolve paths in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const resolvePath = (...segments) => path.join(__dirname, ...segments);

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the project root (Index.html, favicon later, etc.)
app.use(express.static(__dirname));

// Serve the Proposal folder so the browser can load its HTML, CSS, JS
app.use("/Proposal", express.static(resolvePath("Proposal")));

// Route for the main landing page
app.get("/", (req, res) => {
  // File name is "Index.html" with a capital I
  res.sendFile(resolvePath("Index.html"));
});

// Route for the proposal page
app.get("/proposals", (req, res) => {
  res.sendFile(resolvePath("Proposal", "Gurdeep_Gursimransingh_proposals.html"));
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
