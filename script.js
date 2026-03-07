/* JDZ Builder client script
   Features:
   - Instant template thumbnails + hover preview
   - Template selection
   - Editor <-> Preview two-way sync
   - Autosave + snapshots (localStorage)
   - Undo / Redo (history stacks)
   - Add / Remove / Drag reorder sections
   - AI endpoints (rewrite / generate-section) calls
   - Export ZIP (JSZip)
   - Publish stub (calls backend)
*/

const templates = {
  startup: {
    title: "Startup",
    thumb: "Launch fast, modern startup",
    html: `<section class="hero"><h1>Launch Your Startup</h1><p>Fast, modern, and built for growth.</p></section><section><h2>Features</h2><ul><li>Fast setup</li><li>Modern design</li><li>Scalable architecture</li></ul></section>`
  },
  portfolio: {
    title: "Portfolio",
    thumb: "Showcase your work",
    html: `<section class="hero"><h1>My Portfolio</h1><p>Showcasing my best work.</p></section><section><h2>Projects</h2><div class="projects">Project 1 • Project 2 • Project 3</div></section>`
  },
  business: {
    title: "Business",
    thumb: "Professional services",
    html: `<section class="hero"><h1>Business Solutions</h1><p>Professional services for modern companies.</p></section><section><h2>Our Services</h2><p>Consulting, Strategy, Growth.</p></section>`
  },
  "online-store": {
    title: "Online Store",
    thumb: "Simple e-commerce layout",
    html: `<section class="hero"><h1>Shop the Latest</h1><p>Modern e-commerce layout.</p></section><section><h2>Featured Products</h2><div class="product-grid">[product grid]</div></section>`
  }
};

// DOM
const templateGrid = document.getElementById("templateGrid");
const previewEl = document.getElementById("preview");
const editorEl = document.getElementById("editor");
const ideaInput = document.getElementById("ideaInput");
const generateBtn = document.getElementById("generateBtn");
const exportZipBtn = document.getElementById("exportZipBtn");
const undoBtn = document.getElementById("undoBtn");
const redoBtn = document.getElementById("redoBtn");
const saveSnapshotBtn = document.getElementById("saveSnapshotBtn");
const snapshotsList = document.getElementById("snapshotsList");
const autosaveIndicator = document.getElementById("autosaveIndicator");
const statusMsg = document.getElementById("statusMsg");
const selectedTemplateLabel = document.getElementById("selectedTemplateLabel");
const publishBtn = document.getElementById("publishBtn");
const addHeroBtn = document.getElementById("addHero");
const addFeaturesBtn = document.getElementById("addFeatures");
const addFooterBtn = document.getElementById("addFooter");

// State
let selectedTemplate = null;
let undoStack = [];
let redoStack = [];
let isTyping = false;
let autosaveTimer = null;
const AUTOSAVE_KEY = "jdz_autosave_v1";
const SNAPSHOTS_KEY = "jdz_snapshots_v1";

// Initialize thumbnails
function initTemplateGrid(){
  templateGrid.innerHTML = "";
  Object.keys(templates).forEach(key => {
    const t = templates[key];
    const div = document.createElement("div");
    div.className = "template-thumb";
    div.dataset.template = key;
    div.innerHTML = `<div class="thumb-title">${t.title}</div><div class="thumb-sub">${t.thumb}</div>`;
    // hover preview
    div.addEventListener("mouseenter", () => {
      previewEl.innerHTML = t.html;
    });
    // click select
    div.addEventListener("click", () => {
      document.querySelectorAll(".template-thumb").forEach(n=>n.classList.remove("active"));
      div.classList.add("active");
      selectedTemplate = key;
      selectedTemplateLabel.textContent = t.title;
      loadTemplateInstant(key);
      pushHistory(); // record selection as a state
    });
    templateGrid.appendChild(div);
  });
}

// Load template instantly into preview & editor
function loadTemplateInstant(key){
  const html = templates[key].html;
  previewEl.innerHTML = html;
  editorEl.value = html;
  markDirty();
}

// Two-way sync
editorEl.addEventListener("input", () => {
  previewEl.innerHTML = editorEl.value;
  markDirty();
  pushHistoryDebounced();
});
previewEl.addEventListener("input", () => {
  editorEl.value = previewEl.innerHTML;
  markDirty();
  pushHistoryDebounced();
});

// Undo/Redo
function pushHistory(){
  undoStack.push(editorEl.value);
  if(undoStack.length>100) undoStack.shift();
  redoStack = [];
  updateUndoRedoButtons();
}
let pushTimeout = null;
function pushHistoryDebounced(){
  clearTimeout(pushTimeout);
  pushTimeout = setTimeout(()=>{ pushHistory(); }, 350);
}
function undo(){
  if(undoStack.length===0) return;
  const current = editorEl.value;
  const prev = undoStack.pop();
  redoStack.push(current);
  editorEl.value = prev;
  previewEl.innerHTML = prev;
  updateUndoRedoButtons();
}
function redo(){
  if(redoStack.length===0) return;
  const next = redoStack.pop();
  undoStack.push(editorEl.value);
  editorEl.value = next;
  previewEl.innerHTML = next;
  updateUndoRedoButtons();
}
function updateUndoRedoButtons(){
  undoBtn.disabled = undoStack.length===0;
  redoBtn.disabled = redoStack.length===0;
}
undoBtn.addEventListener("click", undo);
redoBtn.addEventListener("click", redo);

// Autosave + snapshots
function autosave(){
  const payload = {
    html: editorEl.value,
    selectedTemplate,
    timestamp: Date.now()
  };
  localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(payload));
  autosaveIndicator.textContent = "Autosave: saved";
  setTimeout(()=> autosaveIndicator.textContent = "Autosave: idle", 1200);
}
function loadAutosave(){
  const raw = localStorage.getItem(AUTOSAVE_KEY);
  if(!raw) return;
  try{
    const p = JSON.parse(raw);
    editorEl.value = p.html || "";
    previewEl.innerHTML = p.html || "";
    selectedTemplate = p.selectedTemplate || null;
    if(selectedTemplate) {
      selectedTemplateLabel.textContent = templates[selectedTemplate]?.title || selectedTemplate;
      document.querySelectorAll(".template-thumb").forEach(n=>{
        n.classList.toggle("active", n.dataset.template===selectedTemplate);
      });
    }
  }catch(e){}
}
function saveSnapshot(){
  const raw = localStorage.getItem(SNAPSHOTS_KEY);
  const arr = raw ? JSON.parse(raw) : [];
  arr.unshift({html: editorEl.value, ts: Date.now()});
  localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(arr.slice(0,50)));
  renderSnapshots();
}
function renderSnapshots(){
  const raw = localStorage.getItem(SNAPSHOTS_KEY);
  const arr = raw ? JSON.parse(raw) : [];
  snapshotsList.innerHTML = "";
  arr.forEach((s, i) => {
    const li = document.createElement("li");
    const date = new Date(s.ts).toLocaleString();
    li.innerHTML = `<div><small>${date}</small></div><div style="margin-top:6px"><button data-index="${i}" class="restore">Restore</button> <button data-index="${i}" class="delete">Delete</button></div>`;
    snapshotsList.appendChild(li);
  });
}
snapshotsList.addEventListener("click", (e)=>{
  if(e.target.matches(".restore")){
    const idx = Number(e.target.dataset.index);
    const arr = JSON.parse(localStorage.getItem(SNAPSHOTS_KEY) || "[]");
    const s = arr[idx];
    if(s){ editorEl.value = s.html; previewEl.innerHTML = s.html; pushHistory(); }
  } else if(e.target.matches(".delete")){
    const idx = Number(e.target.dataset.index);
    const arr = JSON.parse(localStorage.getItem(SNAPSHOTS_KEY) || "[]");
    arr.splice(idx,1);
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(arr));
    renderSnapshots();
  }
});

// Debounced autosave
function markDirty(){
  clearTimeout(autosaveTimer);
  autosaveIndicator.textContent = "Autosave: pending";
  autosaveTimer = setTimeout(autosave, 1200);
}

// Add / Remove / Drag sections
function createSectionNode(html){
  const wrapper = document.createElement("div");
  wrapper.className = "jdz-section";
  wrapper.draggable = true;
  wrapper.innerHTML = `<div class="section-controls"><button class="move">☰</button> <button class="remove">Remove</button> <button class="rewrite">AI Rewrite</button></div><div class="section-body">${html}</div>`;
  // remove
  wrapper.querySelector(".remove").addEventListener("click", ()=>{
    wrapper.remove();
    syncFromSections();
    pushHistory();
  });
  // rewrite (AI)
  wrapper.querySelector(".rewrite").addEventListener("click", async ()=>{
    const body = wrapper.querySelector(".section-body");
    const text = body.innerText || body.textContent || "";
    statusMsg.textContent = "AI rewriting...";
    try{
      const res = await fetch("/api/ai/rewrite", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({text, style:"concise"})
      });
      const j = await res.json();
      if(j.html) body.innerHTML = j.html;
      else if(j.text) body.innerHTML = `<p>${escapeHtml(j.text)}</p>`;
      statusMsg.textContent = "AI rewrite done";
      syncFromSections();
      pushHistory();
    }catch(err){
      console.error(err); statusMsg.textContent = "AI rewrite failed";
    }
  });

  // drag handlers
  wrapper.addEventListener("dragstart", (e)=>{
    e.dataTransfer.setData("text/jdz-section", "");
    wrapper.classList.add("dragging");
  });
  wrapper.addEventListener("dragend", ()=> wrapper.classList.remove("dragging"));
  return wrapper;
}

function syncFromSections(){
  // build HTML from all .jdz-section .section-body
  const sections = Array.from(document.querySelectorAll(".jdz-section .section-body"));
  const html = sections.map(s => s.innerHTML).join("\n");
  editorEl.value = html;
  previewEl.innerHTML = html;
  markDirty();
}

function enableSectionDragDrop(){
  const container = previewEl;
  container.addEventListener("dragover", (e)=>{
    e.preventDefault();
    const dragging = document.querySelector(".dragging");
    const after = getDragAfterElement(container, e.clientY);
    if(!dragging) return;
    if(after == null) container.appendChild(dragging);
    else container.insertBefore(dragging, after);
  });
  container.addEventListener("drop", ()=>{
    syncFromSections();
    pushHistory();
  });
}
function getDragAfterElement(container, y){
  const draggableElements = [...container.querySelectorAll(".jdz-section:not(.dragging)")];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height/2;
    if(offset < 0 && offset > closest.offset){
      return {offset, element: child};
    } else return closest;
  }, {offset: Number.NEGATIVE_INFINITY}).element;
}

// Add section buttons
addHeroBtn.addEventListener("click", ()=>{
  const node = createSectionNode(`<section class="hero"><h1>New Hero</h1><p>Editable hero</p></section>`);
  previewEl.appendChild(node);
  syncFromSections();
  pushHistory();
});
addFeaturesBtn.addEventListener("click", ()=>{
  const node = createSectionNode(`<section><h2>Features</h2><ul><li>Feature A</li><li>Feature B</li></ul></section>`);
  previewEl.appendChild(node);
  syncFromSections();
  pushHistory();
});
addFooterBtn.addEventListener("click", ()=>{
  const node = createSectionNode(`<footer class="jdz-footer"><span class="jdz-mark">JDZ</span></footer>`);
  previewEl.appendChild(node);
  syncFromSections();
  pushHistory();
});

// AI Generate Section (calls backend)
generateBtn.addEventListener("click", async ()=>{
  const idea = ideaInput.value.trim();
  if(!idea){ statusMsg.textContent = "Type an idea first."; return; }
  generateBtn.disabled = true;
  statusMsg.textContent = "AI generating section...";
  try{
    const res = await fetch("/api/ai/generate-section", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({idea, template:selectedTemplate || "startup", sectionType:"hero"})
    });
    const j = await res.json();
    const html = j.html || `<section><h2>${escapeHtml(j.title||"Generated")}</h2><p>${escapeHtml(j.text||"")}</p></section>`;
    const node = createSectionNode(html);
    previewEl.appendChild(node);
    syncFromSections();
    pushHistory();
    statusMsg.textContent = "AI section added";
  }catch(err){
    console.error(err); statusMsg.textContent = "AI generation failed";
  }finally{ generateBtn.disabled = false; }
});

// Export ZIP (client-side)
exportZipBtn.addEventListener("click", async ()=>{
  exportZipBtn.disabled = true;
  statusMsg.textContent = "Preparing ZIP...";
  try{
    const zip = new JSZip();
    const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>JDZ Export</title><link rel="stylesheet" href="style.css"></head><body>${editorEl.value}</body></html>`;
    zip.file("index.html", html);
    // include CSS (inline minimal)
    const css = `body{font-family:system-ui;background:#fff;color:#111} /* minimal export CSS */`;
    zip.file("style.css", css);
    const content = await zip.generateAsync({type:"blob"});
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url; a.download = "jdz-site.zip"; document.body.appendChild(a); a.click(); a.remove();
    statusMsg.textContent = "ZIP ready";
  }catch(err){
    console.error(err); statusMsg.textContent = "ZIP failed";
  }finally{ exportZipBtn.disabled = false; }
});

// Publish to GitHub Pages (backend stub)
publishBtn.addEventListener("click", async ()=>{
  publishBtn.disabled = true;
  statusMsg.textContent = "Publishing (stub)...";
  try{
    const res = await fetch("/api/publish", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({html: editorEl.value, repo:"your-repo", branch:"gh-pages"})
    });
    const j = await res.json();
    if(j.ok) statusMsg.textContent = "Published: " + (j.url || "done");
    else statusMsg.textContent = "Publish failed";
  }catch(err){
    console.error(err); statusMsg.textContent = "Publish error";
  }finally{ publishBtn.disabled = false; }
});

// Utility: escape
function escapeHtml(s){ return (s||"").replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]); }

// Initialize sections from editor HTML (wrap each top-level tag into a section node)
function loadEditorAsSections(){
  const html = editorEl.value || "";
  previewEl.innerHTML = ""; // clear
  // parse top-level nodes
  const temp = document.createElement("div");
  temp.innerHTML = html;
  // if there are no nodes, create a default section
  if(!temp.firstElementChild){
    const node = createSectionNode(`<section><p>Start building...</p></section>`);
    previewEl.appendChild(node);
  } else {
    Array.from(temp.children).forEach(ch=>{
      const node = createSectionNode(ch.outerHTML);
      previewEl.appendChild(node);
    });
  }
}

// History initial push
function initHistory(){
  undoStack = [];
  redoStack = [];
  pushHistory();
  updateUndoRedoButtons();
}

// Load autosave on start
initTemplateGrid();
loadAutosave();
renderSnapshots();
initHistory();
enableSectionDragDrop();

// When editor changes externally (e.g., template click), rebuild sections
editorEl.addEventListener("change", loadEditorAsSections);

// push initial state
pushHistory();

// small helper: when page unload, autosave
window.addEventListener("beforeunload", autosave);

// expose some debug
window.JDZ = { templates, pushHistory, autosave };
