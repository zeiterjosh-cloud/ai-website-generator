/* ---------------------------------------------------
   JDZ DESIGNS — PREMIUM GALLERY INTERACTIONS
--------------------------------------------------- */

/* ---------- SUBSTANCE SWITCHING ---------- */
const substanceCards = document.querySelectorAll(".substance-card");
const previewInner = document.querySelector(".preview-inner");

substanceCards.forEach(card => {
  card.addEventListener("click", () => {
    // Remove active from all
    substanceCards.forEach(c => c.classList.remove("active"));

    // Activate selected
    card.classList.add("active");

    // Update preview
    const substance = card.getAttribute("data-substance");
    previewInner.setAttribute("data-substance", substance);
  });
});

/* ---------- MODE SWITCHING (Desktop / Tablet / Mobile / Live) ---------- */
const modeButtons = document.querySelectorAll(".mode-btn");

modeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    modeButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const mode = btn.getAttribute("data-mode");
    previewInner.setAttribute("data-mode", mode);
  });
});

/* ---------- BEFORE / AFTER TOGGLE ---------- */
const beforeAfterButtons = document.querySelectorAll("#before-after-toggle button");

beforeAfterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    beforeAfterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const view = btn.getAttribute("data-view");
    previewInner.setAttribute("data-view", view);
  });
});

/* ---------- INSIGHTS PANEL ---------- */
const insightsPanel = document.getElementById("insights-panel");

if (insightsPanel) {
  insightsPanel.addEventListener("click", () => {
    insightsPanel.classList.toggle("active");
  });
}

/* ---------- COMPARE MODAL ---------- */
const compareBtn = document.getElementById("compare-substances-btn");
const compareModal = document.getElementById("compare-modal");
const compareClose = document.getElementById("compare-close");
const compareOk = document.getElementById("compare-ok");

if (compareBtn) {
  compareBtn.addEventListener("click", () => {
    compareModal.classList.add("active");
  });
}

if (compareClose) {
  compareClose.addEventListener("click", () => {
    compareModal.classList.remove("active");
  });
}

if (compareOk) {
  compareOk.addEventListener("click", () => {
    compareModal.classList.remove("active");
  });
}

/* ---------- SCROLL PREVIEW ---------- */
const scrollPreviewBtn = document.getElementById("scroll-preview-btn");
const previewSections = document.getElementById("preview-sections");

if (scrollPreviewBtn && previewSections) {
  scrollPreviewBtn.addEventListener("click", () => {
    previewSections.scrollIntoView({ behavior: "smooth" });
  });
}

/* ---------- MAGNETIC HOVER EFFECT ---------- */
const magneticElements = document.querySelectorAll(".magnetic");

magneticElements.forEach(el => {
  const strength = 20;

  el.addEventListener("mousemove", e => {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    el.style.transform = `translate(${x / strength}px, ${y / strength}px)`;
  });

  el.addEventListener("mouseleave", () => {
    el.style.transform = "translate(0, 0)";
  });
});
