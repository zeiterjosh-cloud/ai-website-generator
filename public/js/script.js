const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const page = document.body.getAttribute("data-page");

/* STEP 1 — GALLERY */
if (page === "gallery") {
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

  const modeBtns = $$(".mode-btn");
  modeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      modeBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      previewInner.setAttribute("data-mode", btn.dataset.mode);
    });
  });

  const viewBtns = $$("#before-after-toggle button");
  viewBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      viewBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      previewInner.setAttribute("data-view", btn.dataset.view);
    });
  });

  const insights = $("#insights-panel");
  if (insights) {
    insights.addEventListener("click", () => {
      insights.classList.toggle("active");
    });
  }

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

  const scrollBtn = $("#scroll-preview-btn");
  const previewSections = $("#preview-sections");
  if (scrollBtn && previewSections) {
    scrollBtn.addEventListener("click", () => {
      previewSections.scrollIntoView({ behavior: "smooth" });
    });
  }
}

/* STEP 2 — BUILDER */
if (page === "builder") {
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

  const addSectionBtn = $("#apply-template");
  if (addSectionBtn) {
    addSectionBtn.addEventListener("click", () => {
      addSectionBtn.textContent = "Applied";
      addSectionBtn.style.opacity = "0.9";
      setTimeout(() => {
        addSectionBtn.textContent = "Apply Content";
        addSectionBtn.style.opacity = "1";
      }, 1400);
    });
  }

  const aiAssistBtn = $("#open-ai-assist");
  const insights = $("#insights-panel");
  if (aiAssistBtn && insights) {
    aiAssistBtn.addEventListener("click", () => {
      insights.classList.add("active");
      setTimeout(() => insights.classList.remove("active"), 3500);
    });
  }
}

/* STEP 3 — CUSTOMIZE */
if (page === "customize") {
  const root = document.documentElement;

  $("#accentColor")?.addEventListener("input", e => {
    root.style.setProperty("--accent", e.target.value);
    root.style.setProperty("--accent-soft", e.target.value + "33");
  });

  $("#bgColor")?.addEventListener("input", e => {
    root.style.setProperty("--bg", e.target.value);
  });

  $("#headingFont")?.addEventListener("change", e => {
    const h = document.querySelector(".preview-demo h1");
    if (h) h.style.fontFamily = e.target.value;
  });

  $("#bodyFont")?.addEventListener("change", e => {
    const p = document.querySelector(".preview-demo p");
    if (p) p.style.fontFamily = e.target.value;
  });

  $("#radiusSelect")?.addEventListener("change", e => {
    const r = e.target.value;
    root.style.setProperty("--radius", r);
    const btn = $("#demoButton");
    if (btn) btn.style.borderRadius = r;
  });
}

/* STEP 4 — REVIEW */
if (page === "review") {
  $("#exportHTML")?.addEventListener("click", async () => {
    alert("HTML export endpoint is wired. Hook up real content/styles when ready.");
  });

  $("#exportZIP")?.addEventListener("click", async () => {
    alert("ZIP export endpoint is wired. Hook up real content/styles when ready.");
  });
}
