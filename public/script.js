
function scrollToGenerator(){

document.getElementById("generator").scrollIntoView({

behavior:"smooth"

})

}



function generateAI(){

const ideas=[

"🚀 Going live on Twitch! Come hang out and watch some epic gameplay!",

"🔥 New stream tonight! Join the community and chat live!",

"🎮 Grinding ranked today! Watch the climb live on Twitch!",

"⚡ Big stream event tonight! Don't miss it!",

"🏆 Watch insane plays and funny moments live on my channel!"

]

let random=ideas[Math.floor(Math.random()*ideas.length)]

document.getElementById("postInput").value=random

}



function createPost(){

let text=document.getElementById("postInput").value

if(text===""){

alert("Write something first!")

return

}

let post={

content:text,

likes:0

}



let posts=JSON.parse(localStorage.getItem("posts"))||[]

posts.unshift(post)

localStorage.setItem("posts",JSON.stringify(posts))

displayPosts()

}



function displayPosts(){

let feed=document.getElementById("feed")

feed.innerHTML=""

let posts=JSON.parse(localStorage.getItem("posts"))||[]



posts.forEach((post,index)=>{

let div=document.createElement("div")

div.className="post"

div.innerHTML=`

<p>${post.content}</p>

<button class="likeBtn" onclick="likePost(${index})">

👍 Like (${post.likes})

</button>

`

feed.appendChild(div)

})

}



function likePost(index){

let posts=JSON.parse(localStorage.getItem("posts"))||[]

posts[index].likes++

localStorage.setItem("posts",JSON.stringify(posts))

displayPosts()

}



function toggleDark(){

document.body.classList.toggle("dark")

}



displayPosts()
