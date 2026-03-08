// ============================================================
// JDZ DESIGNS — EXPRESS SERVER
// Serves all 5 steps of the builder flow
// ============================================================

const express = require("express");
const path = require("path");
const app = express();

// ------------------------------------------------------------
// STATIC FILES
// ------------------------------------------------------------
app.use(express.static(path.join(__dirname, "public")));

// ------------------------------------------------------------
// ROUTES — PAGE FLOW
// ------------------------------------------------------------

// Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Step 1 — Choose Template
app.get("/gallery", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "gallery.html"));
});

// Step 2 — Add Content
app.get("/builder", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "builder.html"));
});

// Step 3 — Style
app.get("/customize", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "customize.html"));
});

// Step 4 — Review / Export
app.get("/review", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "review.html"));
});

// ------------------------------------------------------------
// 404 FALLBACK
// ------------------------------------------------------------
app.use((req, res) => {
  res.status(404).send(`
    <h1 style="font-family:Arial;padding:40px;">
      404 — Page Not Found<br><br>
      <a href="/" style="color:#00eaff;">Return Home</a>
    </h1>
  `);
});

// ------------------------------------------------------------
// SERVER START
// ------------------------------------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`JDZ server running at http://localhost:${PORT}`);
});
