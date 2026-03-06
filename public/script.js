function generate(){

let prompt=document.getElementById("prompt").value
let type=document.getElementById("type").value
let mode=document.getElementById("mode").value
let custom=document.getElementById("customText").value

let text=""

if(mode==="ai"){
text="Welcome to "+prompt+". Discover amazing features and join the community."
}else{
text=custom
}

let output=""

if(type==="website"){
output=`
<h2>${prompt}</h2>
<p>${text}</p>

<h3>Features</h3>
<ul>
<li>Modern design</li>
<li>Easy navigation</li>
<li>Fast loading</li>
</ul>

<button>Get Started</button>
`
}

if(type==="marketing"){
output=`
<h2>${prompt}</h2>
<p>${text}</p>

<button>Join Now</button>
<button>Learn More</button>
`
}

if(type==="app"){
output=`
<h2>${prompt} App</h2>
<p>${text}</p>

<h3>App Features</h3>
<ul>
<li>User accounts</li>
<li>Progress tracking</li>
<li>Notifications</li>
</ul>
`
}

document.getElementById("result").innerHTML=output
}
