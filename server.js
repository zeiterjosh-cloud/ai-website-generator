const express = require("express")

const app = express()
const PORT = process.env.PORT || 10000

app.use(express.json())
app.use(express.static("public"))

function generateSections(prompt){

prompt = prompt.toLowerCase()

if(prompt.includes("bakery")){
return [
["About Our Bakery","We bake fresh bread and pastries every morning."],
["Our Products","Cakes, pastries, donuts, and artisan breads."],
["Order Online","Place orders online for pickup or delivery."]
]
}

if(prompt.includes("twitch") || prompt.includes("stream")){
return [
["Live Streams","Watch our live gaming streams."],
["Stream Schedule","See when the next stream starts."],
["Join The Community","Chat and connect with fans."]
]
}

if(prompt.includes("gaming")){
return [
["Latest Games","Discover new and trending games."],
["Community","Connect with gamers worldwide."],
["Guides","Learn strategies and tips."]
]
}

return [
["Welcome","A modern website generated from your idea."],
["Features","Clean design and fast performance."],
["Get Started","Build something amazing."]
]

}

app.post("/generate", (req,res)=>{

const prompt = req.body.prompt || "My Website"

const sections = generateSections(prompt)

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

.section{
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

footer{
background:#020617;
padding:40px;
text-align:center;
margin-top:40px;
}

</style>

</head>

<body>

<nav>

<div><b>${prompt}</b></div>

<div>
<a href="#">Home</a>
<a href="#sections">Sections</a>
<a href="#">Contact</a>
</div>

</nav>

<section class="hero">

<h1>${prompt}</h1>

<p>Generated automatically from your idea</p>

<button onclick="document.getElementById('sections').scrollIntoView({behavior:'smooth'})">
Get Started
</button>

</section>

<section class="section" id="sections">

<h2>Website Sections</h2>

<div class="cards">

<div class="card">
<h3>${sections[0][0]}</h3>
<p>${sections[0][1]}</p>
</div>

<div class="card">
<h3>${sections[1][0]}</h3>
<p>${sections[1][1]}</p>
</div>

<div class="card">
<h3>${sections[2][0]}</h3>
<p>${sections[2][1]}</p>
</div>

</div>

</section>

<footer>

<p>Generated with your AI website generator</p>

</footer>

</body>

</html>
`

res.json({html})

})

app.listen(PORT,()=>{
console.log("Server running on port " + PORT)
})
