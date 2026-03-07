document.addEventListener("DOMContentLoaded", () => {
  const backGallery = document.getElementById("backGallery");
  const templateLabel = document.getElementById("templateLabel");
  const previewTemplateLabel = document.getElementById("previewTemplateLabel");
  const builderStatus = document.getElementById("builderStatus");
  const sectionEditor = document.getElementById("sectionEditor");
  const builderPreviewFrame = document.getElementById("builderPreviewFrame");

  const aiRewriteBtn = document.getElementById("aiRewriteBtn");
  const aiGenerateBtn = document.getElementById("aiGenerateBtn");
  const applyToPreviewBtn = document.getElementById("applyToPreviewBtn");
  const exportBtn = document.getElementById("exportBtn");
  const publishBtn = document.getElementById("publishBtn");

  const params = new URLSearchParams(window.location.search);
  const template = params.get("template") || "gaming";

  templateLabel.textContent = `Template: ${template.toUpperCase()}`;
  previewTemplateLabel.textContent = template.toUpperCase();

  backGallery?.addEventListener("click", () => {
    window.location.href = "/gallery";
  });

  const setStatus = (msg) => {
    if (builderStatus) builderStatus.textContent = msg;
  };

  const loadTemplate = async () => {
    setStatus("Loading template…");
    try {
      const res = await fetch(`/api/templates/${template}`);
      if (!res.ok) throw new Error("Template not found");
      const html = await res.text();

      // Put into editor
      sectionEditor.value = html.trim();

      // Put into preview iframe
      builderPreviewFrame.innerHTML = "";
      const iframe = document.createElement("iframe");
      builderPreviewFrame.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(html);
      doc.close();

      setStatus("Template loaded.");
    } catch (err) {
      builderPreviewFrame.innerHTML = `<div class="jdz-preview-placeholder">Error loading template.</div>`;
      setStatus("Error loading template.");
    }
  };

  loadTemplate();

  aiRewriteBtn?.addEventListener("click", async () => {
    const text = sectionEditor.value.trim();
    if (!text) return;

    setStatus("AI rewriting…");
    try {
      const res = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (data.rewritten) {
        sectionEditor.value = data.rewritten;
        setStatus("AI rewrite applied.");
      } else {
        setStatus("AI rewrite failed.");
      }
    } catch (err) {
      setStatus("AI rewrite error.");
    }
  });

  aiGenerateBtn?.addEventListener("click", async () => {
    const prompt = prompt("Describe the section you want to generate:");
    if (!prompt) return;

    setStatus("AI generating section…");
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (data.html) {
        sectionEditor.value += "\n\n" + data.html;
        setStatus("AI section appended.");
      } else {
        setStatus("AI generate failed.");
      }
    } catch (err) {
      setStatus("AI generate error.");
    }
  });

  applyToPreviewBtn?.addEventListener("click", () => {
    const html = sectionEditor.value.trim();
    if (!html) return;

    builderPreviewFrame.innerHTML = "";
    const iframe = document.createElement("iframe");
    builderPreviewFrame.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    setStatus("Preview updated.");
  });

  exportBtn?.addEventListener("click", async () => {
    const html = sectionEditor.value.trim();
    if (!html) return;

    setStatus("Exporting…");
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html })
      });
      const data = await res.json();
      if (data.html) {
        // Simple download as .html file
        const blob = new Blob([data.html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "jdz-site.html";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        setStatus("Exported as HTML file.");
      } else {
        setStatus("Export failed.");
      }
    } catch (err) {
      setStatus("Export error.");
    }
  });

  publishBtn?.addEventListener("click", async () => {
    const html = sectionEditor.value.trim();
    if (!html) return;

    setStatus("Publishing (stub)…");
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html })
      });
      const data = await res.json();
      if (data.url) {
        alert(`Stubbed publish URL:\n${data.url}`);
        setStatus("Publish stub complete.");
      } else {
        setStatus("Publish failed.");
      }
    } catch (err) {
      setStatus("Publish error.");
    }
  });
});
