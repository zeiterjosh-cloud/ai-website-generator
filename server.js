const express = require("express");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Routes – pages
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/gallery", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "gallery.html"));
});

app.get("/builder", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "builder.html"));
});

// Templates API – simple file-based templates
app.get("/api/templates/:name", (req, res) => {
  const name = req.params.name.toLowerCase();
  const allowed = ["gaming", "portfolio", "store"];

  if (!allowed.includes(name)) {
    return res.status(404).json({ error: "Template not found" });
  }

  const filePath = path.join(__dirname, "public", "templates", `${name}.html`);
  res.sendFile(filePath);
});

// AI rewrite – stubbed logic
app.post("/api/ai/rewrite", (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Missing text" });
  }

  // Simple "rewrite" stub: clean + add JDZ flair
  const rewritten = `JDZ Rewrite:\n\n${text.trim()}\n\n— Refined for the neon web.`;
  res.json({ rewritten });
});

// AI generate – stubbed logic
app.post("/api/ai/generate", (req, res) => {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Missing prompt" });
  }

  const generated = `
<section class="jdz-section">
  <h2>${prompt.trim()}</h2>
  <p>This section was generated based on your idea. Customize it to match your substance.</p>
</section>
  `.trim();

  res.json({ html: generated });
});

// Export – stubbed (returns HTML string)
app.post("/api/export", (req, res) => {
  const { html } = req.body;
  if (!html || typeof html !== "string") {
    return res.status(400).json({ error: "Missing html" });
  }

  // In a real system you'd zip; here we just return the HTML
  res.json({
    message: "Export ready",
    html
  });
});

// Publish – stubbed
app.post("/api/publish", (req, res) => {
  const { html } = req.body;
  if (!html || typeof html !== "string") {
    return res.status(400).json({ error: "Missing html" });
  }

  // Stub: pretend we published and return a fake URL
  res.json({
    message: "Site published (stubbed)",
    url: "https://example.com/your-jdz-site"
  });
});

app.listen(PORT, () => {
  console.log(`JDZ Legacy server running on port ${PORT}`);
});
