
function scrollToGenerator(){
document.getElementById("generator").scrollIntoView({
behavior:"smooth"
});
}


function generateAI(){

const ideas = [

"🚀 Promote your Twitch stream like a pro! Join my channel and watch awesome gameplay live!",

"🔥 New stream tonight! Come hang out, chat, and watch epic gaming moments live.",

"🎮 Gamers unite! Follow my Twitch channel for exciting gameplay and fun community vibes.",

"⚡ Going live soon! Don’t miss the action, crazy plays, and good vibes.",

"🏆 Grinding to the top! Watch the journey live on my Twitch channel."

];

let randomIdea = ideas[Math.floor(Math.random() * ideas.length)];

document.getElementById("postInput").value = randomIdea;

}


function createPost(){

let text = document.getElementById("postInput").value;

if(text === ""){
alert("Write something or generate AI text first!");
return;
}

let preview = document.getElementById("postPreview");

preview.innerHTML = `
<div class="postCard">
<p>${text}</p>
<small>Posted just now</small>
</div>
`;

}
