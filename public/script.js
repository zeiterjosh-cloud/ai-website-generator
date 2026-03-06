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
<link rel="stylesheet" href="style.css">
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
<link rel="stylesheet" href="style.css">
</head>
<body>

<h1>${name}</h1>
<p>Watch my live streams and join the community.</p>

<button>Watch Stream</button>

<h2>Features</h2>
<ul>
<li>Live Gameplay</li>
<li>Community Chat</li>
<li>Highlights</li>
</ul>

</body>
</html>
`

}

document.getElementById("preview").textContent = html

const blob = new Blob([html], { type: "text/html" })

const link = document.createElement("a")

link.href = URL.createObjectURL(blob)

link.download = "index.html"

link.innerText = "Download Website"

document.getElementById("download").innerHTML = ""

document.getElementById("download").appendChild(link)

}
