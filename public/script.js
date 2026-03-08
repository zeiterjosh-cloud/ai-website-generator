// Substance selection
const substanceList = document.getElementById("substance-list");
if (substanceList) {
  substanceList.addEventListener("click", (e) => {
    const card = e.target.closest(".substance-card");
    if (!card) return;
    document
      .querySelectorAll(".substance-card")
      .forEach((el) => el.classList.remove("active"));
    card.classList.add("active");
    // You could store this selection for later:
    // const chosen = card.dataset.substance;
  });
}

// Scroll preview
const scrollBtn = document.getElementById("scroll-preview-btn");
const previewSections = document.getElementById("preview-sections");
if (scrollBtn && previewSections) {
  scrollBtn.addEventListener("click", () => {
    previewSections.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

// Compare modal
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

// Use template (placeholder)
const useTemplateBtn = document.getElementById("use-template-btn");
if (useTemplateBtn) {
  useTemplateBtn.addEventListener("click", () => {
    // Hook this into your actual flow (e.g., navigate to step 2)
    console.log("Template selected. Proceed to next step.");
  });
}
