const leftWeight = document.getElementById("leftWeight");
const rightWeight = document.getElementById("rightWeight");
const nextWeight = document.getElementById("nextWeight");
const tiltAngle = document.getElementById("angle");
const seesawClickable = document.getElementById("seesawClickable");
const seesawPlank = document.getElementById("seesawPlank");
const log = document.getElementById("log");
const resetBtn = document.getElementById("resetBtn");

let leftWeights = [];
let rightWeights = [];
let leftDistances = [];
let rightDistances = [];
let comingWeight = Math.floor(Math.random() * 10 + 1);
let currentAngle = 0;

const colors = [
    "#e74c3c", 
    "#3498db", 
    "#2ecc71", 
    "#f1c40f", 
    "#9b59b6", 
    "#e67e22", 
    "#1abc9c",
    "#e84393", 
    "#34495e", 
    "#7f8c8d"  
];

nextWeight.innerText = `${comingWeight} kg`;

function seesawClick(event) {
    const randomWeight = comingWeight;

    const seesawPlankRect = seesawPlank.getBoundingClientRect();
    const centerPlank = seesawPlankRect.left + seesawPlankRect.width / 2;
    const click = event.clientX;
    const distanceFromCenter = Math.abs(click - centerPlank);

    let side;
    if (click < centerPlank) {
        side = "left";
    } else {
        side = "right";
    }

    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const size = 20 + randomWeight * 5;

    if (side === "left") {
        leftWeights.push(randomWeight);
        leftDistances.push(distanceFromCenter);
        log.innerHTML =`<div class="log-entry">📦 ${randomWeight}kg dropped on left side at ${distanceFromCenter.toFixed()}px from center</div>` + log.innerHTML;
    } else {
        rightWeights.push(randomWeight);
        rightDistances.push(distanceFromCenter);
        log.innerHTML =`<div class="log-entry">📦 ${randomWeight}kg dropped on right side at ${distanceFromCenter.toFixed()}px from center</div>` + log.innerHTML;
    }

    const leftWeightSum = leftWeights.reduce((a, b) => a + b, 0);
    const rightWeightSum = rightWeights.reduce((a, b) => a + b, 0);

    leftWeight.innerText = `${leftWeightSum.toFixed(1)} kg`;
    rightWeight.innerText = `${rightWeightSum.toFixed(1)} kg`;

    currentAngle = calculateTiltAngle(leftWeights, rightWeights, leftDistances, rightDistances);
    tiltAngle.innerText = `${currentAngle.toFixed(1)}°`;
    seesawPlank.style.transform = `translateX(-50%) translateY(-50%) rotate(${currentAngle}deg)`;

    
    comingWeight = Math.floor(Math.random() * 10 + 1);
    nextWeight.innerText = `${comingWeight} kg`;

    saveToLocalStorage();

    const ball = document.createElement("div");
    ball.classList.add("weight-ball");
    ball.style.width = `${size}px`;
    ball.style.height = `${size}px`;
    ball.style.backgroundColor = randomColor;
    ball.style.left = `${click}px`;
    ball.style.top = `0px`;
    ball.style.zIndex = 5;

    ball.style.display = "flex";
    ball.style.alignItems = "center";
    ball.style.justifyContent = "center";
    ball.style.color = "white";
    ball.style.fontWeight = "bold";
    ball.style.fontSize = "12px";
    ball.innerText = `${randomWeight}kg`;

    document.body.appendChild(ball);

    const targetY = seesawPlankRect.top + seesawPlankRect.height / 2 - size / 2;
    setTimeout(() => {
        ball.style.top = `${targetY}px`;
    }, 20);
}

function calculateTiltAngle(leftWeights, rightWeights, leftDistances, rightDistances) {
    let torqueLeft = 0;
    let torqueRight = 0;

    for (let i = 0; i < leftWeights.length; i++) {
        torqueLeft += leftWeights[i] * leftDistances[i];
    }

    for (let i = 0; i < rightWeights.length; i++) {
        torqueRight += rightWeights[i] * rightDistances[i];
    }

    const difference = torqueRight - torqueLeft;
    return Math.max(-30, Math.min(30, difference / 10));
}

function saveToLocalStorage() {
    const state = {
        leftWeights,
        rightWeights,
        leftDistances,
        rightDistances,
        comingWeight,
        currentAngle,
        logText: log.innerText,
    };
    localStorage.setItem("seesawState", JSON.stringify(state));
}

function LoadFromLocalStorage() {
    const savedState = localStorage.getItem("seesawState");
    if (savedState) {
        const state = JSON.parse(savedState);
        leftWeights = state.leftWeights || [];
        rightWeights = state.rightWeights || [];
        leftDistances = state.leftDistances || [];
        rightDistances = state.rightDistances || [];
        comingWeight = state.comingWeight || Math.floor(Math.random() * 10 + 1);
        currentAngle = state.currentAngle || 0;

        const leftWeightSum = leftWeights.reduce((a, b) => a + b, 0);
        const rightWeightSum = rightWeights.reduce((a, b) => a + b, 0);

        leftWeight.innerText = `${leftWeightSum.toFixed(1)} kg`;
        rightWeight.innerText = `${rightWeightSum.toFixed(1)} kg`;
        tiltAngle.innerText = `${currentAngle.toFixed(1)}°`;
        seesawPlank.style.transform = `translateX(-50%) translateY(-50%) rotate(${currentAngle}deg)`;
        nextWeight.innerText = `${comingWeight} kg`;
        log.innerText = state.logText || "";
    }
}

resetBtn.addEventListener("click", () => {
    leftWeights = [];
    rightWeights = [];
    leftDistances = [];
    rightDistances = [];
    comingWeight = Math.floor(Math.random() * 10 + 1);
    currentAngle = 0;

    leftWeight.innerText = "0.0 kg";
    rightWeight.innerText = "0.0 kg";
    tiltAngle.innerText = "0.0°";
    seesawPlank.style.transform = "translateX(-50%) translateY(-50%) rotate(0deg)";
    log.innerText = "";
    nextWeight.innerText = `${comingWeight} kg`;

    localStorage.removeItem("seesawState");

    document.querySelectorAll(".weight-ball").forEach(b => b.remove());
});

window.addEventListener("load", LoadFromLocalStorage);
seesawClickable.addEventListener("click", seesawClick);
