let selectedTemplate = null;
let lastGenerated = null;

const templateCards = document.querySelectorAll(".template-card");
const ideaInput = document.getElementById("ideaInput");
const generateFromIdeaBtn = document.getElementById("generateFromIdea");
const generateSiteBtn = document.getElementById("generateSite");
const previewFrame = document.getElementById("previewFrame");
const downloadLinks = document.getElementById("downloadLinks");

templateCards.forEach(card => {
  card.addEventListener("click", () => {
    templateCards.forEach(c => c.classList.remove("active"));
    card.classList.add("active");
    selectedTemplate = card.dataset.template;
  });
});

generateFromIdeaBtn.addEventListener("click", () => {
  if (!ideaInput.value.trim()) {
    alert("Type an idea first.");
    return;
  }
  selectedTemplate = null;
  templateCards.forEach(c => c.classList.remove("active"));
  alert("Idea captured. Click 'Generate Website' to build it.");
});

generateSiteBtn.addEventListener("click", async () => {
  const idea = ideaInput.value.trim();
  if (!selectedTemplate && !idea) {
    alert("Choose a template or enter an idea.");
    return;
  }

  const payload = {
    template: selectedTemplate,
    idea
  };

  const res = await fetch("/generate-site", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  lastGenerated = data.pages;

  // Preview index.html
  const blob = new Blob([data.pages["index.html"]], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  previewFrame.src = url;

  // Download links
  downloadLinks.innerHTML = "";
  Object.entries(data.pages).forEach(([name, content]) => {
    const fileBlob = new Blob([content], { type: name.endsWith(".css") ? "text/css" : "text/html" });
    const fileUrl = URL.createObjectURL(fileBlob);
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = name;
    a.textContent = `Download ${name}`;
    downloadLinks.appendChild(a);
  });
});
