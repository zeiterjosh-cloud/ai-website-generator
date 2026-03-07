// server.js - minimal Express server
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch"); // if you plan to call an AI provider
const app = express();
app.use(bodyParser.json());
app.use(express.static("."));

// Simple AI rewrite endpoint (stub)
// Replace with your AI provider call (OpenAI, Azure, etc.)
app.post("/api/ai/rewrite", async (req, res) => {
  const { text, style } = req.body || {};
  // Example: return a simple transformation for demo
  const rewritten = `<p>${(text || "").slice(0, 200)} — rewritten (${style||"concise"})</p>`;
  return res.json({ html: rewritten });
});

// AI generate section endpoint (stub)
app.post("/api/ai/generate-section", async (req, res) => {
  const { idea, template, sectionType } = req.body || {};
  // Replace this with a real AI call. For now return a simple hero block.
  const html = `<section class="hero"><h1>${escapeHtml(idea || "Generated Title")}</h1><p>Auto-generated ${sectionType || "section"} for ${template || "template"}.</p></section>`;
  return res.json({ html });
});

// Publish stub (GitHub Pages) - real implementation requires OAuth and repo access
app.post("/api/publish", async (req, res) => {
  // In production: authenticate user, create commit, push to gh-pages branch, return URL
  console.log("Publish request received (stub). Payload keys:", Object.keys(req.body || {}));
  return res.json({ ok: true, url: "https://your-username.github.io/your-repo/" });
});

// Helper
function escapeHtml(s){ return (s||"").replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]); }

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log("Server running on port", PORT));
