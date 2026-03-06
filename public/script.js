async function generateFromTemplate(template) {
  const preview = document.getElementById("preview");
  preview.innerHTML = "<p>Generating...</p>";

  const response = await fetch("/generate-site", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ template })
  });

  const data = await response.json();
  preview.innerHTML = data.pages["index.html"];
  window.generatedPages = data.pages;
}

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
  preview.innerHTML = data.pages["index.html"];
  window.generatedPages = data.pages;
}

function downloadFile(filename) {
  if (!window.generatedPages) return alert("Generate a site first!");

  const content = window.generatedPages[filename];
  const blob = new Blob([content], { type: "text/html" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}
