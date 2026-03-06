function generateWebsite() {

const prompt = document.getElementById("prompt").value;
const customText = document.getElementById("customText").value;
const style = document.getElementById("style").value;

const preview = document.getElementById("preview");

preview.innerHTML = `
<div class="${style}">
<h1>${prompt}</h1>

<p>${customText}</p>

<div class="features">

<div class="card">
<h3>Feature 1</h3>
<p>Fast and modern design.</p>
</div>

<div class="card">
<h3>Feature 2</h3>
<p>Built automatically by AI.</p>
</div>

<div class="card">
<h3>Feature 3</h3>
<p>Fully customizable content.</p>
</div>

</div>

<button>Get Started</button>

</div>
`;
}
