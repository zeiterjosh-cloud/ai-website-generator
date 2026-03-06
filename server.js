const express=require("express");
const bodyParser=require("body-parser");

const app=express();
const PORT=process.env.PORT||10000;

app.use(bodyParser.json());
app.use(express.static("public"));

app.post("/generate",(req,res)=>{

const prompt=req.body.prompt;
const style=req.body.style;

let bg="#0f172a";
let card="#1e293b";

if(style==="colorful"){
bg="#4f46e5";
card="#6366f1";
}

if(style==="dark"){
bg="#020617";
card="#111827";
}

const html=`
<!DOCTYPE html>
<html>
<head>

<title>${prompt}</title>

<style>

body{
font-family:Arial;
background:${bg};
color:white;
text-align:center;
padding:40px;
}

.card{
background:${card};
padding:20px;
margin:20px;
border-radius:10px;
}

button{
padding:12px 20px;
background:#22c55e;
border:none;
color:white;
border-radius:8px;
cursor:pointer;
}

</style>

</head>

<body>

<h1>${prompt}</h1>

<p>This website was generated with AI.</p>

<div class="card">
<h2>About</h2>
<p>This is an automatically generated website.</p>
</div>

<div class="card">
<h2>Features</h2>
<p>Modern design and fast performance.</p>
</div>

<div class="card">
<h2>Contact</h2>
<p>Email: example@email.com</p>
</div>

<button>Get Started</button>

</body>
</html>
`;

res.json({html:html});

});

app.listen(PORT,()=>{

console.log("Server running");

});
