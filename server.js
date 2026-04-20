// ============================================================
// JDZ DESIGNS — EXPRESS SERVER
// Serves all 5 steps of the builder flow + DevBuddy AI
// ============================================================

const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());

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

// Simple in-memory rate limiter: max 20 requests per IP per minute.
// Note: for multi-instance deployments, use a shared store (e.g. Redis).
const rateLimitMap = new Map();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 1000;

// Periodically remove expired entries to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    if (now - entry.start > RATE_WINDOW_MS) rateLimitMap.delete(ip);
  }
}, RATE_WINDOW_MS).unref();

function rateLimit(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.start > RATE_WINDOW_MS) {
    rateLimitMap.set(ip, { start: now, count: 1 });
    return next();
  }

  if (entry.count >= RATE_LIMIT) {
    return res.status(429).json({ error: "Too many requests. Please wait before trying again." });
  }

  entry.count += 1;
  next();
}

// DevBuddy AI
app.get("/devbuddy", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "devbuddy.html"));
});

// DevBuddy AI — code generation endpoint (rate limited)
app.post("/api/generate", rateLimit, async (req, res) => {
  const { prompt, beginnerMode, language } = req.body;

  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "prompt is required" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "OpenAI API key not configured" });
  }

  const lang = language || "JavaScript";
  const systemPrompt = beginnerMode
    ? `You are a beginner-friendly game dev assistant. Generate ${lang} code for the request and explain each part step by step with inline comments. Include a short summary at the top.`
    : `You are an expert game developer. Return only clean, production-ready ${lang} code with no extra prose. Use concise inline comments only where truly necessary.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", errText);
      return res.status(502).json({ error: `AI service returned an error (status: ${response.status})` });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";
    res.json({ code: content });
  } catch (err) {
    console.error("Generate error:", err);
    res.status(500).json({ error: "Failed to generate code" });
  }
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
