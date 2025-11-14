import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const resolvePath = (...segments) => path.join(__dirname, ...segments);
const resolveView = (fileName) => resolvePath("views", fileName);

app.use(cors());
app.use(express.json());

// === Serve static folders ===
// This line serves all CSS, JS, images from /assets
app.use("/assets", express.static(resolvePath("assets")));
// This line allows serving static HTML files from /views directly
app.use(express.static(resolvePath("views")));

// === Routes ===
app.get("/", (req, res) => {
  res.sendFile(resolvePath("index.html"));
});

// === API routes ===

// === Start server ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
