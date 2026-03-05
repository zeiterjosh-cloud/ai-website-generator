const express = require("express");

const app = express();

const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.static("public"));

app.post("/generate", (req, res) => {

const prompt = req.body.prompt || "Generated Website";

const html = `
<!DOCTYPE html>
<html>
<head>
<title>${prompt}</title>

<style>

body{
font-family:Arial;
background:linear-gradient(120deg,#4facfe,#00f2fe);
color:white;
text-align:center;
padding:60px;
}

h1{
font-size:50px;
}

p{
font-size:20px;
}

button{
padding:15px 25px;
font-size:18px;
border:none;
border-radius:10px;
cursor:pointer;
}

</style>

</head>

<body>

<h1>${prompt}</h1>

<p>This website was generated automatically.</p>

<button>Learn More</button>

</body>
</html>
`;

res.json({ html });

});

app.listen(PORT, () => {
console.log("Server running on port " + PORT);
});
