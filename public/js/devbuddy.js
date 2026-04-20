/* DevBuddy AI — frontend logic */
(function () {
  const promptInput   = document.getElementById("prompt-input");
  const generateBtn   = document.getElementById("generate-btn");
  const clearBtn      = document.getElementById("clear-prompt");
  const copyBtn       = document.getElementById("copy-btn");
  const downloadBtn   = document.getElementById("download-btn");
  const codeOutput    = document.getElementById("code-output");
  const codePlaceholder = document.getElementById("code-placeholder");
  const loadingEl     = document.getElementById("loading-indicator");
  const errorEl       = document.getElementById("error-msg");
  const beginnerToggle = document.getElementById("beginner-toggle");
  const langBtns      = document.querySelectorAll(".lang-btn");
  const tplBtns       = document.querySelectorAll(".tpl-btn");

  let currentLang = "C#";
  let lastCode    = "";

  // ── Language selector ──────────────────────────────────────
  langBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      langBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentLang = btn.dataset.lang;
    });
  });

  // ── Template buttons ───────────────────────────────────────
  tplBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      promptInput.value = btn.dataset.tpl;
      promptInput.focus();
    });
  });

  // ── Clear prompt ───────────────────────────────────────────
  clearBtn.addEventListener("click", () => {
    promptInput.value = "";
    promptInput.focus();
  });

  // ── Generate ───────────────────────────────────────────────
  generateBtn.addEventListener("click", generate);
  promptInput.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") generate();
  });

  async function generate() {
    const prompt = promptInput.value.trim();
    if (!prompt) {
      showError("Please enter a prompt before generating.");
      return;
    }

    setLoading(true);
    hideError();
    showPlaceholder(false);
    codeOutput.hidden = true;
    copyBtn.disabled = true;
    downloadBtn.disabled = true;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          beginnerMode: beginnerToggle.checked,
          language: currentLang
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Generation failed");
      }

      lastCode = data.code || "";
      renderCode(lastCode);
    } catch (err) {
      showError(err.message || "Something went wrong. Please try again.");
      showPlaceholder(true);
    } finally {
      setLoading(false);
    }
  }

  function renderCode(code) {
    codeOutput.textContent = code;
    codeOutput.hidden = false;
    copyBtn.disabled = false;
    downloadBtn.disabled = false;
  }

  // ── Copy ───────────────────────────────────────────────────
  copyBtn.addEventListener("click", () => {
    if (!lastCode) return;
    navigator.clipboard.writeText(lastCode).then(() => {
      copyBtn.textContent = "Copied!";
      setTimeout(() => { copyBtn.textContent = "Copy"; }, 1800);
    }).catch(() => {
      fallbackCopy(lastCode);
    });
  });

  function fallbackCopy(text) {
    // Fallback for browsers that don't support navigator.clipboard
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    copyBtn.textContent = "Copied!";
    setTimeout(() => { copyBtn.textContent = "Copy"; }, 1800);
  }

  // ── Download ───────────────────────────────────────────────
  downloadBtn.addEventListener("click", () => {
    if (!lastCode) return;
    const ext = langExtension(currentLang);
    const blob = new Blob([lastCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `devbuddy-output.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  });

  function langExtension(lang) {
    const map = { "C#": "cs", "JavaScript": "js", "Python": "py" };
    return map[lang] || "txt";
  }

  // ── UI helpers ─────────────────────────────────────────────
  function setLoading(on) {
    loadingEl.hidden = !on;
    generateBtn.disabled = on;
    generateBtn.textContent = on ? "Generating…" : "Generate Code →";
  }

  function showPlaceholder(on) {
    codePlaceholder.style.display = on ? "" : "none";
  }

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  function hideError() {
    errorEl.hidden = true;
  }
})();
