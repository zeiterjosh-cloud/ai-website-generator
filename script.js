// Instant template HTML
const templates = {
  startup: `
    <section class="hero">
      <h1>Launch Your Startup</h1>
      <p>Fast, modern, and built for growth.</p>
    </section>
    <section>
      <h2>Features</h2>
      <ul>
        <li>Fast setup</li>
        <li>Modern design</li>
        <li>Scalable architecture</li>
      </ul>
    </section>
  `,

  portfolio: `
    <section class="hero">
      <h1>My Portfolio</h1>
      <p>Showcasing my best work.</p>
    </section>
    <section>
      <h2>Projects</h2>
      <p>Project 1, Project 2, Project 3...</p>
    </section>
  `,

  business: `
    <section class="hero">
      <h1>Business Solutions</h1>
      <p>Professional services for modern companies.</p>
    </section>
    <section>
      <h2>Our Services</h2>
      <p>Consulting, Strategy, Growth.</p>
    </section>
  `,

  "online-store": `
    <section class="hero">
      <h1>Shop the Latest</h1>
      <p>Modern e‑commerce layout.</p>
    </section>
    <section>
      <h2>Featured Products</h2>
      <p>Product grid goes here.</p>
    </section>
  `
};

// DOM elements
const templateButtons = document.querySelectorAll(".template-btn");
const previewEl = document.getElementById("preview");
const editorEl = document.getElementById("editor");

// Template selection + instant preview
templateButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    templateButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const selected = btn.dataset.template;
    const html = templates[selected];

    previewEl.innerHTML = html;
    editorEl.value = html;
  });
});

// Editor → Preview sync
editorEl.addEventListener("input", () => {
  previewEl.innerHTML = editorEl.value;
});

// Preview → Editor sync
previewEl.addEventListener("input", () => {
  editorEl.value = previewEl.innerHTML;
});
