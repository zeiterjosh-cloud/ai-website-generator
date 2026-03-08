// Substance switching
const substanceCards = document.querySelectorAll(".substance-card");
const previewInner = document.querySelector(".preview-inner");

substanceCards.forEach(card => {
  card.addEventListener("click", () => {
    substanceCards.forEach(c => c.classList.remove("active"));
    card.classList.add("active");
    const substance = card.getAttribute("data-substance");
    previewInner.setAttribute("data-substance", substance);
    const title = card.querySelector(".substance-name")?.textContent || "";
    document.querySelector(".preview-title").textContent = title;
  });
});

// Mode switching
const modeButtons = document.querySelectorAll(".mode-btn");

modeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    modeButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const mode = btn.getAttribute("data-mode");
    previewInner.setAttribute("data-mode", mode);
  });
});

// Before/after
const beforeAfterButtons = document.querySelectorAll("#before-after-toggle button");

beforeAfterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    beforeAfterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const view = btn.getAttribute("data-view");
    previewInner.setAttribute("data-view", view);
  });
});

// Insights
const insightsPanel = document.getElementById("insights-panel");
if (insightsPanel) {
  insightsPanel.addEventListener("click", () => {
    insightsPanel.classList.toggle("active");
  });
}

// Compare modal
const compareBtn = document.getElementById("compare-substances-btn");
const compareModal = document.getElementById("compare-modal");
const compareClose = document.getElementById("compare-close");
const compareOk = document.getElementById("compare-ok");

if (compareBtn && compareModal) {
  compareBtn.addEventListener("click", () => {
    compareModal.classList.add("active");
  });
}

[compareClose, compareOk].forEach(el => {
  if (el && compareModal) {
    el.addEventListener("click", () => {
      compareModal.classList.remove("active");
    });
  }
});

// Scroll preview
const scrollPreviewBtn = document.getElementById("scroll-preview-btn");
const previewSections = document.getElementById("preview-sections");

if (scrollPreviewBtn && previewSections) {
  scrollPreviewBtn.addEventListener("click", () => {
    previewSections.scrollIntoView({ behavior: "smooth" });
  });
}
