// MODE SWITCHING
const modeButtons = document.querySelectorAll(".mode-btn");
const previewInner = document.querySelector(".preview-inner");

modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    modeButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const mode = btn.dataset.mode;
    previewInner.setAttribute("data-mode", mode);
  });
});

// SUBSTANCE SELECTION + MORPH
const substanceList = document.getElementById("substance-list");
if (substanceList) {
  substanceList.addEventListener("click", (e) => {
    const card = e.target.closest(".substance-card");
    if (!card) return;

    document
      .querySelectorAll(".substance-card")
      .forEach((el) => el.classList.remove("active"));
    card.classList.add("active");

    const type = card.dataset.substance;
    previewInner.setAttribute("data-substance", type);
  });

  // Hover morph (optional)
  document.querySelectorAll(".substance-card").forEach((card) => {
    card.addEventListener("mouseenter", () => {
      const type = card.dataset.substance;
      previewInner.setAttribute("data-substance", type);
    });
  });
}

// BEFORE / AFTER TOGGLE
const beforeAfterToggle = document.getElementById("before-after-toggle");
if (beforeAfterToggle) {
  beforeAfterToggle.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    beforeAfterToggle
      .querySelectorAll("button")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const view = btn.dataset.view;
    previewInner.setAttribute("data-view", view);
  });
}

// INSIGHTS PANEL TOGGLE
const insightsPanel = document.getElementById("insights-panel");
if (insightsPanel) {
  insightsPanel.addEventListener("click", () => {
    insightsPanel.classList.toggle("open");
  });
}

// SCROLL PREVIEW
const scrollBtn = document.getElementById("scroll-preview-btn");
const previewSections = document.getElementById("preview-sections");
if (scrollBtn && previewSections) {
  scrollBtn.addEventListener("click", () => {
    previewSections.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

// COMPARE MODAL
const compareBtn = document.getElementById("compare-substances-btn");
const compareModal = document.getElementById("compare-modal");
const compareClose = document.getElementById("compare-close");
const compareOk = document.getElementById("compare-ok");

function closeCompare() {
  if (compareModal) compareModal.classList.remove("open");
}

if (compareBtn && compareModal) {
  compareBtn.addEventListener("click", () => {
    compareModal.classList.add("open");
  });
}

if (compareClose) compareClose.addEventListener("click", closeCompare);
if (compareOk) compareOk.addEventListener("click", closeCompare);

if (compareModal) {
  compareModal.addEventListener("click", (e) => {
    if (e.target === compareModal) closeCompare();
  });
}

// USE TEMPLATE (placeholder hook)
const useTemplateBtn = document.getElementById("use-template-btn");
if (useTemplateBtn) {
  useTemplateBtn.addEventListener("click", () => {
    // Hook into your real flow (e.g., go to Step 2)
    console.log("Template selected. Proceed to next step.");
  });
}
