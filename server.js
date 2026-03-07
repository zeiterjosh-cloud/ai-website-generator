const express = require("express")
const cors = require("cors")
const bodyParser = require("body-parser")

const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(express.static("public"))

app.post("/generate", (req, res) => {

const idea = req.body.idea || "Website"

const site = `
<!DOCTYPE html>
<html>
<head>
<title>${idea}</title>
<link rel="stylesheet" href="style.css">
</head>

<body>

<header>
<h1>${idea}</h1>
<p>Generated with JDZ Designs</p>
</header>

<section>
<h2>Features</h2>
<ul>
<li>Modern Design</li>
<li>Fast Performance</li>
<li>Mobile Friendly</li>
</ul>
</section>

<section>
<h2>About</h2>
<p>This website was generated automatically from an idea.</p>
</section>

<section>
<h2>Contact</h2>
<button>Contact Us</button>
</section>

</body>
</html>
`

res.json({site})

})

app.listen(3000, () => {
console.log("JDZ Designs running on http://localhost:3000")
})
