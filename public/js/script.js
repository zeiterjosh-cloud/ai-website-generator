/* ============================================================
   JDZ DESIGNS — MASTER SCRIPT
   Handles all steps: gallery → builder → customize → review
   ============================================================ */

/* Utility: Safe query */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* Utility: Page detection */
const page = document.body.getAttribute("data-page");

/* ============================================================
   STEP 1 — GALLERY (choose template)
   ============================================================ */
if (page === "gallery") {
  console.log("JDZ: Gallery loaded");

  // Substance switching
  const cards = $$(".substance-card");
  const previewInner = $(".preview-inner");
  const previewTitle = $(".preview-title");

  cards.forEach(card => {
    card.addEventListener("click", () => {
      cards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");

      const substance = card.dataset.substance;
      previewInner.setAttribute("data-substance", substance);

      if (previewTitle) {
        previewTitle.textContent = card.querySelector(".substance-name").textContent;
      }
    });
  });

  // Mode switching
  const modeBtns = $$(".mode-btn");
  modeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      modeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      previewInner.setAttribute("data-mode", btn.dataset.mode);
    });
  });

  // Before/after
  const viewBtns = $$("#before-after-toggle button");
  viewBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      viewBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      previewInner.setAttribute("data-view", btn.dataset.view);
    });
  });

  // Insights panel
  const insights = $("#insights-panel");
  if (insights) {
    insights.addEventListener("click", () => {
      insights.classList.toggle("active");
    });
  }

  // Compare modal
  const compareBtn = $("#compare-substances-btn");
  const compareModal = $("#compare-modal");
  const compareClose = $("#compare-close");
  const compareOk = $("#compare-ok");

  if (compareBtn && compareModal) {
    compareBtn.addEventListener("click", () => compareModal.classList.add("active"));
  }
  [compareClose, compareOk].forEach(el => {
    if (el) el.addEventListener("click", () => compareModal.classList.remove("active"));
  });

  // Scroll preview
  const scrollBtn = $("#scroll-preview-btn");
  const previewSections = $("#preview-sections");
  if (scrollBtn && previewSections) {
    scrollBtn.addEventListener("click", () => {
      previewSections.scrollIntoView({ behavior: "smooth" });
    });
  }
}

/* ============================================================
   STEP 2 — BUILDER (add content)
   ============================================================ */
if (page === "builder") {
  console.log("JDZ: Builder loaded");

  const editor = $("#editor-input");
  const preview = $("#preview-output");
  const clearBtn = $("#clear-editor");
  const applyBtn = $("#apply-content");
  const blockBtns = $$(".block-btn");

  const blocks = {
    hero: `
<section class="block-hero">
  <h1>Your Hero Title</h1>
  <p>Your hero subtitle or mission statement goes here.</p>
</section>
`,
    about: `
<section class="block-about">
  <h2>About You</h2>
  <p>Write a short introduction about your brand, story, or purpose.</p>
</section>
`,
    features: `
<section class="block-features">
  <h2>Key Features</h2>
  <ul>
    <li>Feature one</li>
    <li>Feature two</li>
    <li>Feature three</li>
  </ul>
</section>
`,
    gallery: `
<section class="block-gallery">
  <h2>Image Gallery</h2>
  <div class="gallery-grid">
    <div class="gallery-item"></div>
    <div class="gallery-item"></div>
    <div class="gallery-item"></div>
  </div>
</section>
`,
    cta: `
<section class="block-cta">
  <h2>Ready to Begin?</h2>
  <button class="cta-btn">Get Started</button>
</section>
`
  };

  blockBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const type = btn.dataset.block;
      editor.value += `\n${blocks[type]}\n`;
      editor.scrollTop = editor.scrollHeight;
    });
  });

  applyBtn.addEventListener("click", () => {
    const content = editor.value.trim();
    preview.innerHTML = content || `<p class="placeholder-text">Your content will appear here.</p>`;
  });

  clearBtn.addEventListener("click", () => {
    editor.value = "";
  });
}

/* ============================================================
   STEP 3 — CUSTOMIZE (style editor)
   ============================================================ */
if (page === "customize") {
  console.log("JDZ: Customize loaded");

  const root = document.documentElement;

  $("#accentColor")?.addEventListener("input", e => {
    root.style.setProperty("--accent", e.target.value);
    root.style.setProperty("--accent-soft", e.target.value + "33");
  });

  $("#bgColor")?.addEventListener("input", e => {
    root.style.setProperty("--bg", e.target.value);
  });

  $("#headingFont")?.addEventListener("change", e => {
    $(".preview-demo h1").style.fontFamily = e.target.value;
  });

  $("#bodyFont")?.addEventListener("change", e => {
    $(".preview-demo p").style.fontFamily = e.target.value;
  });

  $("#radiusSelect")?.addEventListener("change", e => {
    root.style.setProperty("--radius", e.target.value);
    $("#demoButton").style.borderRadius = e.target.value;
  });
}

/* ============================================================
   STEP 4 — REVIEW (export)
   ============================================================ */
if (page === "review") {
  console.log("JDZ: Review loaded");

  $("#exportHTML")?.addEventListener("click", () => {
    alert("HTML export coming
