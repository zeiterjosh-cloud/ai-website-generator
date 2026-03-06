function generateWebsite(){

const idea = document.getElementById("siteIdea").value

const indexHTML = `
<!DOCTYPE html>
<html>
<head>
<title>${idea}</title>
<link rel="stylesheet" href="style.css">
</head>
<body>

<h1>${idea}</h1>

<p>Welcome to our website.</p>

<nav>
<a href="index.html">Home</a>
<a href="about.html">About</a>
<a href="contact.html">Contact</a>
</nav>

<section>

<h2>Features</h2>

<ul>
<li>Modern design</li>
<li>Fast website</li>
<li>Mobile friendly</li>
</ul>

</section>

</body>
</html>
`

const aboutHTML = `
<!DOCTYPE html>
<html>
<head>
<title>About</title>
<link rel="stylesheet" href="style.css">
</head>
<body>

<h1>About</h1>

<p>This website was generated automatically.</p>

<a href="index.html">Back Home</a>

</body>
</html>
`

const contactHTML = `
<!DOCTYPE html>
<html>
<head>
<title>Contact</title>
<link rel="stylesheet" href="style.css">
</head>
<body>

<h1>Contact</h1>

<p>Email: example@email.com</p>

<a href="index.html">Back Home</a>

</body>
</html>
`

const styleCSS = `
body{
font-family:Arial;
background:#111;
color:white;
text-align:center;
padding:40px;
}

nav a{
margin:10px;
color:#4CAF50;
text-decoration:none;
font-size:18px;
}
`

document.getElementById("preview").textContent =
"Generated files:\n\nindex.html\nabout.html\ncontact.html\nstyle.css"

const zipContent = indexHTML

const blob = new Blob([zipContent], {type:"text/html"})

const link = document.createElement("a")

link.href = URL.createObjectURL(blob)

link.download = "index.html"

link.innerText = "Download Website"

document.getElementById("download").innerHTML=""

document.getElementById("download").appendChild(link)

}
