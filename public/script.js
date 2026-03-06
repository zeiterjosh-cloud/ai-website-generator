function generateWebsite() {

const prompt = document.getElementById("prompt").value
const customText = document.getElementById("customText").value
const style = document.getElementById("style").value

const preview = document.getElementById("preview")

let background = "white"
let color = "black"

if(style === "dark"){
background = "#111"
color = "white"
}

if(style === "colorful"){
background = "linear-gradient(45deg, purple, blue)"
color = "white"
}

preview.innerHTML = `
<div style="background:${background};color:${color};padding:40px;border-radius:10px">

<h1>${prompt}</h1>

<p>${customText}</p>

<div style="display:flex;gap:20px;margin-top:20px">

<div style="background:white;color:black;padding:20px;border-radius:8px">
<h3>Feature 1</h3>
<p>Fast modern design</p>
</div>

<div style="background:white;color:black;padding:20px;border-radius:8px">
<h3>Feature 2</h3>
<p>Generated automatically</p>
</div>

<div style="background:white;color:black;padding:20px;border-radius:8px">
<h3>Feature 3</h3>
<p>Fully customizable</p>
</div>

</div>

<br>

<button style="padding:10px 20px;font-size:16px">Get Started</button>

</div>
`
}
