const express = require("express");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static("public"));

function generateFeatures(prompt){

prompt = prompt.toLowerCase()

if(prompt.includes("bakery")){
return [
["Fresh Bread","Baked daily with high quality ingredients"],
["Online Orders","Order pastries online easily"],
["Local Delivery","Fast delivery in your area"]
]
}

if(prompt.includes("twitch") || prompt.includes("stream")){
return [
["Live Streams","Watch streams directly on the site"],
["Community Chat","Join the streaming community"],
["Stream Schedule","Never miss a stream"]
]
}

if(prompt.includes("gaming")){
return [
["Game Reviews","Discover the latest games"],
["Community","Join other gamers"],
["Guides","Learn pro strategies"]
]
}

return [
["Fast","Modern and fast website"],
["Custom","Designed automatically from your prompt"],
["Responsive","Works on mobile and desktop"]
]

}

app.post("/generate", (req, res) => {

const prompt = req.body.prompt || "My Website";

const features = generateFeatures(prompt)

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

</style>

</head>

<body>

<nav>
<div><b>${prompt}</b></div>

<div>
<a href="#">Home</a>
<a href="#features">Features</a>
<a href="#">Contact</a>
</div>
</nav>

<section class="hero">

<h1>${prompt}</h1>

<p>A modern website generated automatically</p>

<button onclick="document.getElementById('features').scrollIntoView({behavior:'smooth'})">
Get Started
</button>

</section>

<section class="features" id="features">

<h2>Features</h2>

<div class="cards">

<div class="card">
<h3>${features[0][0]}</h3>
<p>${features[0][1]}</p>
</div>

<div class="card">
<h3>${features[1][0]}</h3>
<p>${features[1][1]}</p>
</div>

<div class="card">
<h3>${features[2][0]}</h3>
<p>${features[2][1]}</p>
</div>

</div>

</section>

</body>

</html>
`;

res.json({ html });

});

app.listen(PORT, () => {
console.log("Server running on port " + PORT);
});
