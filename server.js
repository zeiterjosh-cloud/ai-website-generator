const express = require("express");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static("public"));

app.post("/generate", (req, res) => {

const prompt = req.body.prompt || "My Website";

const html = `
<!DOCTYPE html>
<html>
<head>
<title>${prompt}</title>

<style>

body{
font-family:Arial;
margin:0;
background:#111;
color:white;
}

nav{
background:#000;
padding:15px;
display:flex;
justify-content:space-between;
}

nav a{
color:white;
text-decoration:none;
margin:0 10px;
}

.hero{
padding:100px;
text-align:center;
background:linear-gradient(120deg,#4facfe,#00f2fe);
}

.hero h1{
font-size:60px;
}

.section{
padding:60px;
text-align:center;
}

.card{
background:#222;
padding:20px;
margin:20px;
border-radius:10px;
display:inline-block;
width:250px;
}

button{
padding:15px 25px;
border:none;
border-radius:8px;
background:#00c3ff;
font-size:18px;
cursor:pointer;
}

</style>
</head>

<body>

<nav>
<div><b>${prompt}</b></div>
<div>
<a href="#">Home</a>
<a href="#">About</a>
<a href="#">Contact</a>
</div>
</nav>

<div class="hero">
<h1>${prompt}</h1>
<p>A website generated automatically.</p>
<button>Get Started</button>
</div>

<div class="section">

<div class="card">
<h3>Feature One</h3>
<p>This section describes something about the site.</p>
</div>

<div class="card">
<h3>Feature Two</h3>
<p>This section explains another feature.</p>
</div>

<div class="card">
<h3>Feature Three</h3>
<p>This section highlights more information.</p>
</div>

</div>

</body>
</html>
`;

res.json({ html });

});

app.listen(PORT, () => {
console.log("Server running on port " + PORT);
});
