console.log("Ocean Guardian Loaded");

const ocean = document.getElementById("ocean");
const trashLayer = document.getElementById("trashLayer");
const scoreText = document.getElementById("score");
const timerText = document.getElementById("timer");
const startBtn = document.getElementById("startBtn");

let score = 0;
let gameRunning = false;
let timeLeft = 60;
let timerInterval;

function createBottle(){

    console.log("Bottle created");

    const bottle = document.createElement("img");

    bottle.src = "images/ocean-guardian/sprites/plastic-bottle.png";
    console.log("Bottle path:", bottle.src);

    bottle.className = "bottle";

    bottle.style.left = Math.random()*85 + "%";
    bottle.style.top = Math.random()*80 + "%";

    bottle.onclick = function(){

        if(!gameRunning) return;

        score += 10;
      scoreText.innerText = score;

        bottle.remove();

        createBottle();

    };

trashLayer.appendChild(bottle);

}

startBtn.onclick = function(){

    if(gameRunning) return;

    gameRunning = true;

    score = 0;
    timeLeft = 60;

    scoreText.innerText = score;
    timerText.innerText = timeLeft;

    trashLayer.innerHTML = "";

    // Create 6 bottles
    for(let i = 0; i < 6; i++){

        createBottle();

    }

    clearInterval(timerInterval);

    timerInterval = setInterval(function(){

        timeLeft--;

        timerText.innerText = timeLeft;

        if(timeLeft <= 0){

        clearInterval(timerInterval);

            gameRunning = false;

            alert("🌊 Mission Complete!\n\nEco Points: " + score);

        }

    },1000);

    alert("Mission Started!");

};