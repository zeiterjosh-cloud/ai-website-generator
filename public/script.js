function generateWebsite() {

const name = document.getElementById("siteName").value

const template = document.getElementById("template").value

let html = ""

if(template === "business") {

html = `
<!DOCTYPE html>
<html>
<head>
<title>${name}</title>
</head>
<body>

<h1>${name}</h1>

<p>Welcome to our business website.</p>

<h2>Services</h2>

<ul>
<li>Consulting</li>
<li>Marketing</li>
<li>Business Growth</li>
</ul>

<button>Contact Us</button>

</body>
</html>
`

}

if(template === "twitch") {

html = `
<!DOCTYPE html>
<html>
<head>
<title>${name}</title>
</head>
<body>

<h1>${name}</h1>

<p>Welcome to my streaming page.</p>

<button>Watch Stream</button>

<h2>Features</h2>

<ul>
<li>Live gameplay</li>
<li>Viewer chat</li>
<li>Highlights</li>
</ul>

</body>
</html>
`

}

if(template === "portfolio") {

html = `
<!DOCTYPE html>
<html>
<head>
<title>${name}</title>
</head>
<body>

<h1>${name}</h1>

<p>This is my portfolio website.</p>

<h2>Projects</h2>

<ul>
<li>Website design</li>
<li>Marketing tools</li>
<li>App ideas</li>
</ul>

<h2>Contact</h2>

<p>Email: example@email.com</p>

</body>
</html>
`

}

document.getElementById("preview").textContent = html

const blob = new Blob([html], {type:"text/html"})

const link = document.createElement("a")

link.href = URL.createObjectURL(blob)

link.download = "index.html"

link.innerText = "Download Website"

document.getElementById("download").innerHTML = ""

document.getElementById("download").appendChild(link)

}
