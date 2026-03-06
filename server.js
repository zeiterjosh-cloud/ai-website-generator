const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 10000;

app.use(bodyParser.json());
app.use(express.static("public"));

app.post("/generate", (req, res) => {
    const prompt = req.body.prompt;

    const html = `
<!DOCTYPE html>
<html>
<head>
<title>${prompt}</title>
<style>
body{
font-family: Arial;
background:#0f172a;
color:white;
text-align:center;
padding:40px;
}
button{
padding:12px 20px;
background:#6366f1;
border:none;
color:white;
border-radius:8px;
cursor:pointer;
}
.card{
background:#1e293b;
padding:20px;
margin:20px;
border-radius:10px;
}
</style>
</head>

<body>

<h1>${prompt}</h1>
<p>This website was generated automatically.</p>

<div class="card">
<h2>Feature 1</h2>
<p>Fast modern design</p>
</div>

<div class="card">
<h2>Feature 2</h2>
<p>Mobile responsive</p>
</div>

<div class="card">
<h2>Feature 3</h2>
<p>Easy customization</p>
</div>

<button>Get Started</button>

</body>
</html>
`;

res.json({html: html});
});

app.listen(PORT, () => {
console.log("Server running on port " + PORT);
});
