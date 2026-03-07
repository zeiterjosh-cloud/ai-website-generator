// Generate from a template
async function generateFromTemplate(template) {
  const preview = document.getElementById("preview");
  preview.innerHTML = "<p>Generating...</p>";

  const response = await fetch("/generate-site", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ template })
  });

  const data = await response.json();
  window.generatedPages = data.pages;

  switchPreview("index.html");
}

// Generate from an idea
async function generateFromIdea() {
  const idea = document.getElementById("ideaInput").value;
  const preview = document.getElementById("preview");

  preview.innerHTML = "<p>Generating...</p>";

  const response = await fetch("/generate-site", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea })
  });

  const data = await response.json();
  window.generatedPages = data.pages;

  switchPreview("index.html");
}

// Switch preview tabs
function switchPreview(filename) {
  if (!window.generatedPages) {
    document.getElementById("preview").innerHTML = "Generate a site first!";
    return;
  }

  const content = window.generatedPages[filename];
  document.getElementById("preview").innerHTML = content;

  document.getElementById("tab-index").style.background = filename === "index.html" ? "#22d3ee" : "";
  document.getElementById("tab-about").style.background = filename === "about.html" ? "#22d3ee" : "";
  document.getElementById("tab-contact").style.background = filename === "contact.html" ? "#22d3ee" : "";
}

// Download a file
function downloadFile(filename) {
  if (!window.generatedPages) {
    alert("Generate a site first!");
    return;
  }

  const content = window.generatedPages[filename];
  const blob = new Blob([content], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}
