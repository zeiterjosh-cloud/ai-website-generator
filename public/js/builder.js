/* ---------------------------------------------------
   JDZ DESIGNS — STEP 2: BUILDER INTERACTIONS
--------------------------------------------------- */

/* ---------- ELEMENTS ---------- */
const editorInput = document.getElementById("editor-input");
const previewOutput = document.getElementById("preview-output");
const clearBtn = document.getElementById("clear-editor");
const applyBtn = document.getElementById("apply-content");
const blockButtons = document.querySelectorAll(".block-btn");
const aiGenerateBtn = document.querySelector(".ai-generate-btn");

/* ---------- PREDEFINED BLOCKS ---------- */
const blocks = {
  hero: `
    <section class="block-hero">
      <h1>Your Hero Title</h1>
      <p>Your hero subtitle or mission statement goes here.</p>
    </section>
  `,
  about: `
    <section class="block-about">
      <h2>About You</h2>
      <p>Write a short introduction about your brand, story, or purpose.</p>
    </section>
  `,
  features: `
    <section class="block-features">
      <h2>Key Features</h2>
      <ul>
        <li>Feature one</li>
        <li>Feature two</li>
        <li>Feature three</li>
      </ul>
    </section>
  `,
  gallery: `
    <section class="block-gallery">
      <h2>Image Gallery</h2>
      <div class="gallery-grid">
        <div class="gallery-item"></div>
        <div class="gallery-item"></div>
        <div class="gallery-item"></div>
      </div>
    </section>
  `,
  cta: `
    <section class="block-cta">
      <h2>Ready to Begin?</h2>
      <button class="cta-btn">Get Started</button>
    </section>
  `
};

/* ---------- INSERT BLOCK INTO EDITOR ---------- */
blockButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const blockType = btn.getAttribute("data-block");
    const blockContent = blocks[blockType];

    editorInput.value += `\n${blockContent}\n`;
    editorInput.scrollTop = editorInput.scrollHeight;
  });
});

/* ---------- APPLY CONTENT TO PREVIEW ---------- */
applyBtn.addEventListener("click", () => {
  const content = editorInput.value.trim();

  if (content === "") {
    previewOutput.innerHTML = `<p class="placeholder-text">Your content will appear here.</p>`;
    return;
  }

  previewOutput.innerHTML = content;
});

/* ---------- CLEAR EDITOR ---------- */
clearBtn.addEventListener("click", () => {
  editorInput.value = "";
});

/* ---------- AI GENERATE SECTION (HOOK ONLY) ---------- */
aiGenerateBtn.addEventListener("click", () => {
  alert("AI section generation will be added in Step 3.");
});

/* ---------- OPTIONAL: SMOOTH SCROLL FOR PREVIEW ---------- */
document.querySelector(".continue-btn")?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
