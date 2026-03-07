document.addEventListener("DOMContentLoaded", () => {
  const backHome = document.getElementById("backHome");
  const cards = document.querySelectorAll(".jdz-template-card");
  const previewFrame = document.getElementById("previewFrame");
  const previewStatus = document.getElementById("previewStatus");
  const useTemplateBtn = document.getElementById("useTemplateBtn");

  let selectedTemplate = null;

  backHome?.addEventListener("click", () => {
    window.location.href = "/";
  });

  const setPreview = async (templateName) => {
    previewStatus.textContent = "Loading…";

    try {
      const res = await fetch(`/api/templates/${templateName}`);
      if (!res.ok) throw new Error("Template not found");
      const html = await res.text();

      previewFrame.innerHTML = "";
      const iframe = document.createElement("iframe");
      previewFrame.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.open();
      doc.write(html);
      doc.close();

      previewStatus.textContent = templateName.toUpperCase();
    } catch (err) {
      previewFrame.innerHTML = `<div class="jdz-preview-placeholder">Error loading template.</div>`;
      previewStatus.textContent = "Error";
    }
  };

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      cards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");

      const template = card.getAttribute("data-template");
      selectedTemplate = template;
      useTemplateBtn.disabled = false;
      setPreview(template);
    });
  });

  useTemplateBtn?.addEventListener("click", () => {
    if (!selectedTemplate) return;
    const url = new URL("/builder", window.location.origin);
    url.searchParams.set("template", selectedTemplate);
    window.location.href = url.toString();
  });
});
