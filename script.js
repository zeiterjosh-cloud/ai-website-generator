const templateButtons = document.querySelectorAll(".template-btn");
const ideaInput = document.getElementById("idea-input");
const generateBtn = document.getElementById("generate-btn");
const statusEl = document.getElementById("status");
const previewEl = document.getElementById("preview");
const editorEl = document.getElementById("editor");

let selectedTemplate = null;

// Template selection
templateButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    templateButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    selectedTemplate = btn.dataset.template;
  });
});

// Sync editor -> preview
editorEl.addEventListener("input", (e) => {
  previewEl.innerHTML = e.target.value;
});

// Sync preview -> editor (inline editing)
previewEl.addEventListener("input", () => {
  editorEl.value = previewEl.innerHTML;
});

// Generate from backend
generateBtn.addEventListener("click", async () => {
  const idea = ideaInput.value.trim();

  if (!idea && !selectedTemplate) {
    statusEl.textContent = "Add an idea or choose a template.";
    return;
  }

  generateBtn.disabled = true;
  statusEl.textContent = "Generating...";
  previewEl.innerHTML = "";
  editorEl.value = "";

  try {
    // Adjust this URL/path to match your backend route
    const response = await fetch("/generate-site", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idea,
        template: selectedTemplate,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to generate site");
    }

    const data = await response.json();
    const generatedHTML = data.html || "<p>No HTML returned.</p>";

    // Populate both preview and editor
    previewEl.innerHTML = generatedHTML;
    editorEl.value = generatedHTML;

    statusEl.textContent = "Generated.";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Error generating site.";
    previewEl.innerHTML = "<p>Something went wrong.</p>";
  } finally {
    generateBtn.disabled = false;
  }
});
