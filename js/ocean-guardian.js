console.log("Ocean Guardian Loaded");

const ocean = document.getElementById("ocean");

const scoreText = document.getElementById("score");

const timerText = document.getElementById("timer");

const startBtn = document.getElementById("startBtn");

let score = 0;

let gameRunning = false;

function createBottle(){

    const bottle = document.createElement("img");

bottle.src = "file:///C:/sagacious-tribe/assets/images/ocean-guardian/sprites/plastic-bottle.png";

bottle.className = "bottle";

    bottle.style.left =
        Math.random()*85+"%";

    bottle.style.top =
        Math.random()*80+"%";

    bottle.onclick = function(){

        if(!gameRunning) return;

        score += 10;

        scoreText.innerText = score;

        bottle.remove();

        createBottle();

    };

    ocean.appendChild(bottle);

}

startBtn.onclick = function(){

    if(gameRunning) return;

    gameRunning = true;

    score = 0;

    scoreText.innerText = score;

    ocean.innerHTML = "";

    for(let i=0;i<6;i++){

        createBottle();

    }

    alert("Mission Started!");

};