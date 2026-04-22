// ============================================================
// DEVBUDDY — Floating AI Chat Assistant
// Mounts itself on every page of the JDZ builder flow.
// ============================================================

(function () {
  // Determine page — use explicit equality comparisons so no DOM-derived
  // string ever flows into innerHTML via dynamic object indexing.
  const rawPage = document.body.getAttribute("data-page");
  const isGallery   = rawPage === "gallery";
  const isBuilder   = rawPage === "builder";
  const isCustomize = rawPage === "customize";
  const isReview    = rawPage === "review";

  // ----------------------------------------------------------
  // Contextual tip sets per page (all hardcoded string literals)
  // ----------------------------------------------------------
  const homeTips = [
    "Click <strong>Start with a template →</strong> to begin your website in seconds.",
    "JDZ Designs lets you build a full website in 4 steps: template → content → style → export.",
    "Each template (Substance) is fully customizable — pick the one that feels closest to your goal."
  ];
  const galleryTips = [
    "<strong>CATALYST</strong> is the most versatile starting point for most sites.",
    "<strong>SOLIDLOAD</strong> shines for product launches and marketing pages.",
    "<strong>BASTONEY</strong> is ideal for portfolios and story-driven content.",
    "Use the <em>Before / After</em> toggle to see how AI fills in a raw template.",
    "Switch between Desktop, Tablet, and Mobile to preview responsive behavior."
  ];
  const builderTips = [
    "Use the content-block buttons in the sidebar to add pre-built sections instantly.",
    "Type or paste your copy into the Content Editor, then hit <em>Apply to Preview →</em>.",
    "Click <em>AI Assist</em> to get copywriting suggestions for your hero and features.",
    "You can add multiple sections — hero, about, features, gallery, and CTA.",
    "When you're happy with the content, click <em>Continue to Style →</em>."
  ];
  const customizeTips = [
    "Adjust the <em>Accent Color</em> to match your brand — it affects buttons, links, and highlights.",
    "Pair a bold heading font (e.g. Montserrat) with a clean body font (e.g. Inter) for great readability.",
    "Larger corner radii give a friendlier, rounded feel; smaller radii look sharper and more corporate.",
    "All changes update live in the preview — no need to save."
  ];
  const reviewTips = [
    "Use <em>Export HTML</em> to download a single self-contained file you can host anywhere.",
    "Use <em>Export Full ZIP</em> to get all assets and stylesheets in one package.",
    "Need to tweak something? Use the navigation links to jump back to any earlier step.",
    "Once exported, open the HTML file in any browser to see your finished site."
  ];

  // ----------------------------------------------------------
  // Canned responses matched against user input keywords.
  // Response strings (r) are hardcoded literals never derived from input.
  // ----------------------------------------------------------
  const R_TEMPLATE  = "There are three substances: <strong>CATALYST</strong> (balanced), <strong>SOLIDLOAD</strong> (launch-focused), and <strong>BASTONEY</strong> (portfolio/story). Pick the one that fits your goal and refine it in the builder.";
  const R_CONTENT   = "Use the block buttons in the builder sidebar to insert pre-built sections (Hero, About, Features, Gallery, CTA). You can also type or paste your own HTML into the content editor.";
  const R_COLOR     = "Head to the <strong>Style</strong> step (Step 3) to change accent color, background color, fonts, and corner radius. Every change updates live in the preview.";
  const R_FONT      = "Open the <strong>Style</strong> step to pick from Inter, Poppins, Montserrat, or Space Grotesk for your headings and body text.";
  const R_EXPORT    = "Go to the <strong>Review &amp; Export</strong> step (Step 4) to download your site as a standalone HTML file or a full ZIP with all assets.";
  const R_AI        = "On the Builder page click the <em>AI Assist</em> button — it opens the Insights panel with AI-powered copywriting suggestions for your headings and hero section.";
  const R_HELP      = "JDZ Designs has four steps: 1 — Choose a template, 2 — Add content, 3 — Style it, 4 — Review &amp; export. Use the navigation buttons to move between them.";
  const R_PREVIEW   = "Use the <em>Desktop / Tablet / Mobile</em> toggle in the preview controls to check how your site looks at different screen widths.";
  const R_FALLBACK  = "I'm not sure about that one — try asking about templates, content, styling, or exporting. Or use the <em>Next</em> button to continue building your site!";

  // ----------------------------------------------------------
  // Build DOM
  // ----------------------------------------------------------
  const toggle = document.createElement("button");
  toggle.id = "devbuddy-toggle";
  toggle.className = "devbuddy-toggle";
  toggle.setAttribute("aria-label", "Open DevBuddy assistant");
  toggle.innerHTML = `<span class="devbuddy-icon">🤖</span>`;

  const panel = document.createElement("div");
  panel.id = "devbuddy-panel";
  panel.className = "devbuddy-panel";
  panel.setAttribute("aria-live", "polite");
  panel.innerHTML = `
    <div class="devbuddy-header">
      <span class="devbuddy-title">DevBuddy</span>
      <button class="devbuddy-close" aria-label="Close DevBuddy">✕</button>
    </div>
    <div class="devbuddy-messages" id="devbuddy-messages"></div>
    <div class="devbuddy-tips" id="devbuddy-tips"></div>
    <div class="devbuddy-input-row">
      <input id="devbuddy-input" class="devbuddy-input" type="text" placeholder="Ask anything…" autocomplete="off" />
      <button id="devbuddy-send" class="devbuddy-send" aria-label="Send">→</button>
    </div>
  `;

  document.body.appendChild(toggle);
  document.body.appendChild(panel);

  // ----------------------------------------------------------
  // References
  // ----------------------------------------------------------
  const messagesEl = document.getElementById("devbuddy-messages");
  const tipsEl     = document.getElementById("devbuddy-tips");
  const inputEl    = document.getElementById("devbuddy-input");
  const sendBtn    = document.getElementById("devbuddy-send");
  const closeBtn   = panel.querySelector(".devbuddy-close");

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------

  /** Append a bot message — content must always be a hardcoded literal. */
  function addBotHTML(html) {
    const el = document.createElement("div");
    el.className = "devbuddy-msg devbuddy-msg--bot";
    el.innerHTML = html;
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  /** Append a user message — content is always rendered as plain text. */
  function addUserText(text) {
    const el = document.createElement("div");
    el.className = "devbuddy-msg devbuddy-msg--user";
    el.textContent = text;
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function getPageTips() {
    // Explicit branching on validated booleans — no DOM-derived string
    // ever flows into array indexing or innerHTML.
    if (isGallery)   return galleryTips;
    if (isBuilder)   return builderTips;
    if (isCustomize) return customizeTips;
    if (isReview)    return reviewTips;
    return homeTips;
  }

  function showTips() {
    const pageTips = getPageTips();
    tipsEl.innerHTML = "";
    pageTips.forEach((tip) => {
      const btn = document.createElement("button");
      btn.className = "devbuddy-tip-btn";
      // tip is a hardcoded string literal — safe to use as innerHTML.
      btn.innerHTML = tip;
      btn.addEventListener("click", () => {
        // Use the closed-over hardcoded literal directly.
        addBotHTML(tip);
        tipsEl.style.display = "none";
      });
      tipsEl.appendChild(btn);
    });
  }

  function openPanel() {
    panel.classList.add("devbuddy-panel--open");
    toggle.classList.add("devbuddy-toggle--active");
    toggle.setAttribute("aria-label", "Close DevBuddy assistant");
    if (!messagesEl.children.length) {
      addBotHTML("Hi! I'm <strong>DevBuddy</strong> 👋 — your JDZ build assistant. Ask me anything or tap a tip below.");
      showTips();
    }
    inputEl.focus();
  }

  function closePanel() {
    panel.classList.remove("devbuddy-panel--open");
    toggle.classList.remove("devbuddy-toggle--active");
    toggle.setAttribute("aria-label", "Open DevBuddy assistant");
  }

  function handleSend() {
    const text = inputEl.value.trim();
    if (!text) return;

    // Render user message as plain text — never as HTML.
    addUserText(text);
    inputEl.value = "";
    tipsEl.style.display = "none";

    // Determine the bot reply by keyword-matching the lowercased input.
    // The reply is always a hardcoded constant; it is never derived from the
    // user's text, so no tainted data reaches addBotHTML / innerHTML.
    const lower = text.toLowerCase();
    let botReply = R_FALLBACK;
    if (["template","substance","catalyst","solidload","bastoney"].some(k => lower.includes(k))) {
      botReply = R_TEMPLATE;
    } else if (["content","section","hero","about","features","gallery","cta"].some(k => lower.includes(k))) {
      botReply = R_CONTENT;
    } else if (["color","colour","accent","background","theme"].some(k => lower.includes(k))) {
      botReply = R_COLOR;
    } else if (["font","typography","heading","body"].some(k => lower.includes(k))) {
      botReply = R_FONT;
    } else if (["export","download","zip","html"].some(k => lower.includes(k))) {
      botReply = R_EXPORT;
    } else if (["ai","assist","generate","copy","write"].some(k => lower.includes(k))) {
      botReply = R_AI;
    } else if (["help","how","what","start"].some(k => lower.includes(k))) {
      botReply = R_HELP;
    } else if (["preview","mobile","tablet","desktop","responsive"].some(k => lower.includes(k))) {
      botReply = R_PREVIEW;
    }

    setTimeout(() => addBotHTML(botReply), 380);
  }

  // ----------------------------------------------------------
  // Events
  // ----------------------------------------------------------
  toggle.addEventListener("click", () => {
    panel.classList.contains("devbuddy-panel--open") ? closePanel() : openPanel();
  });

  closeBtn.addEventListener("click", closePanel);
  sendBtn.addEventListener("click", handleSend);
  inputEl.addEventListener("keydown", e => {
    if (e.key === "Enter") handleSend();
  });
})();
