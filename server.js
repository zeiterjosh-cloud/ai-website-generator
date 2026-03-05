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
background:#0f172a;
color:white;
}

nav{
background:#020617;
padding:15px 40px;
display:flex;
justify-content:space-between;
align-items:center;
}

nav a{
color:white;
text-decoration:none;
margin-left:20px;
}

.hero{
padding:120px 40px;
text-align:center;
background:linear-gradient(120deg,#3b82f6,#06b6d4);
}

.hero h1{
font-size:64px;
margin-bottom:20px;
}

.hero p{
font-size:22px;
margin-bottom:30px;
}

button{
padding:15px 30px;
font-size:18px;
border:none;
border-radius:10px;
background:white;
color:black;
cursor:pointer;
}

.features{
padding:80px 40px;
text-align:center;
}

.cards{
display:flex;
justify-content:center;
gap:30px;
flex-wrap:wrap;
}

.card{
background:#1e293b;
padding:30px;
border-radius:12px;
width:260px;
}

.card h3{
margin-top:0;
}

footer{
text-align:center;
padding:40px;
background:#020617;
margin-top:60px;
}

</style>

</head>

<body>

<nav>
<div><b>${prompt}</b></div>

<div>
<a href="#">Home</a>
<a href="#">Features</a>
<a href="#">Contact</a>
</div>
</nav>

<section class="hero">

<h1>${prompt}</h1>

<p>A modern website automatically generated.</p>

<button>Get Started</button>

</section>

<section class="features">

<h2>Features</h2>

<div class="cards">

<div class="card">
<h3>Fast</h3>
<p>This website loads quickly and looks modern.</p>
</div>

<div class="card">
<h3>Custom</h3>
<p>Your prompt changes the website content.</p>
</div>

<div class="card">
<h3>Responsive</h3>
<p>The layout works on phones and desktops.</p>
</div>

</div>

</section>

<footer>

<p>Generated automatically</p>

</footer>

</body>
</html>
`;

res.json({ html });

});

app.listen(PORT, () => {
console.log("Server running on port " + PORT);
});
