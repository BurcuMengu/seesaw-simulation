const leftWeight = document.getElementById("leftWeight");
const rightWeight = document.getElementById("rightWeight");
const nextWeight = document.getElementById("nextWeight");
const tiltAngle = document.getElementById("angle");
const seesawClickable = document.getElementById("seesawClickable");
const seesawPlank = document.getElementById("seesawPlank");
const log = document.getElementById("log");
const resetBtn = document.getElementById("resetBtn");

let leftWeightList = [];
let rightWeightList = [];
let leftDistanceList = [];
let rightDistanceList = [];
let comingWeight = Math.floor(Math.random() * 10 + 1);
let currentAngle = 0;
let ballInfos = []; // keep every ball to move them later

const colorOptions = [ // simple palette for balls
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

const maxTiltNumber = 30; // limit angle for plank not rotates more

nextWeight.innerText = `${comingWeight} kg`;

function seesawClick(event) {
    const randomWeight = comingWeight;

    const metrics = getPlankBox(); // get plank position for calculations
    const angleBeforeDrop = (currentAngle * Math.PI) / 180;
    const axisX = Math.cos(angleBeforeDrop);
    const axisY = Math.sin(angleBeforeDrop);

    const dx = event.clientX - metrics.centerX;
    const dy = event.clientY - metrics.centerY;

    let signedDistance = dx * axisX + dy * axisY; // reflect click onto plank axis
    signedDistance = clampDistance(signedDistance);
    const distanceFromCenter = Math.abs(signedDistance);
    const side = signedDistance < 0 ? "left" : "right";

    const randomColor = getRandomColor();

    if (side === "left") {
        leftWeightList.push(randomWeight);
        leftDistanceList.push(distanceFromCenter);
        log.innerHTML = `<div class="log-entry">📦 ${randomWeight}kg dropped on left side at ${distanceFromCenter.toFixed()}px from center</div>` + log.innerHTML;
    } else {
        rightWeightList.push(randomWeight);
        rightDistanceList.push(distanceFromCenter);
        log.innerHTML = `<div class="log-entry">📦 ${randomWeight}kg dropped on right side at ${distanceFromCenter.toFixed()}px from center</div>` + log.innerHTML;
    }

    const updatedLeftWeightSum = leftWeightList.reduce((a, b) => a + b, 0);
    const updatedRightWeightSum = rightWeightList.reduce((a, b) => a + b, 0);

    leftWeight.innerText = `${updatedLeftWeightSum.toFixed(1)} kg`;
    rightWeight.innerText = `${updatedRightWeightSum.toFixed(1)} kg`;

    currentAngle = makeTiltValue(leftWeightList, rightWeightList, leftDistanceList, rightDistanceList); // recompute tilt after drop
    tiltAngle.innerText = `${currentAngle.toFixed(1)}°`;
    seesawPlank.style.transform = `translateX(-50%) translateY(-50%) rotate(${currentAngle}deg)`;

    const updatedMetrics = getPlankBox();
    moveBallsWithBoard(updatedMetrics);

    const afterDir = getPlankDirectionNumbers(); // direction of plank after tilt
    const { ball, size } = makeBallDiv(randomWeight, randomColor);
    const targetPosition = findBallCenterPoint(updatedMetrics, afterDir.axisX, afterDir.axisY, signedDistance);
    const startY = updatedMetrics.rect.top - size - 30;

    ball.style.left = `${targetPosition.x}px`;
    ball.style.top = `${startY}px`;
    document.body.appendChild(ball);

    const ballRecord = {
        element: ball,
        signedDistance,
        size,
        weight: randomWeight,
        color: randomColor
    };

    ballInfos.push(ballRecord);
    ball.style.zIndex = `${20 + (ballInfos.length - 1)}`;

    // let the ball fall straight down toward the plank
    requestAnimationFrame(() => {
        ball.style.top = `${targetPosition.y}px`;
    });

    comingWeight = Math.floor(Math.random() * 10 + 1);
    nextWeight.innerText = `${comingWeight} kg`;

    rememberStuff();
}

function makeTiltValue(leftWeights, rightWeights, leftDistances, rightDistances) {
    let torqueLeft = 0;
    let torqueRight = 0;

    for (let i = 0; i < leftWeights.length; i++) {
        torqueLeft += leftWeights[i] * leftDistances[i]; // weight * distance on left
    }

    for (let i = 0; i < rightWeights.length; i++) {
        torqueRight += rightWeights[i] * rightDistances[i]; // same for right
    }

    const difference = torqueRight - torqueLeft; // simple torque diff
    return Math.max(-maxTiltNumber, Math.min(maxTiltNumber, difference / 10));
}

function rememberStuff() {
    // drop snapshot into localStorage so page refresh keeps state
    const state = {
        leftWeights: leftWeightList,
        rightWeights: rightWeightList,
        leftDistances: leftDistanceList,
        rightDistances: rightDistanceList,
        comingWeight,
        currentAngle,
        logHtml: log.innerHTML,
        ballStates: ballInfos.map(record => ({
            weight: record.weight,
            signedDistance: record.signedDistance,
            color: record.color
        })),
    };
    localStorage.setItem("seesawState", JSON.stringify(state));
}

function bringSavedStuff() {
    const savedState = localStorage.getItem("seesawState");
    if (!savedState) {
        return;
    }

    const state = JSON.parse(savedState);
    if (
        !state ||
        !Array.isArray(state.leftWeights) ||
        !Array.isArray(state.rightWeights) ||
        !Array.isArray(state.leftDistances) ||
        !Array.isArray(state.rightDistances) ||
        typeof state.currentAngle !== "number" ||
        typeof state.comingWeight !== "number"
    ) {
        return;
    }

    leftWeightList = state.leftWeights;
    rightWeightList = state.rightWeights;
    leftDistanceList = state.leftDistances;
    rightDistanceList = state.rightDistances;
    comingWeight = state.comingWeight;
    currentAngle = state.currentAngle;

    const leftWeightSum = leftWeightList.reduce((a, b) => a + b, 0);
    const rightWeightSum = rightWeightList.reduce((a, b) => a + b, 0);

    leftWeight.innerText = `${leftWeightSum.toFixed(1)} kg`;
    rightWeight.innerText = `${rightWeightSum.toFixed(1)} kg`;
    tiltAngle.innerText = `${currentAngle.toFixed(1)}°`;
    seesawPlank.style.transform = `translateX(-50%) translateY(-50%) rotate(${currentAngle}deg)`;
    nextWeight.innerText = `${comingWeight} kg`; // show next random weight

    if (typeof state.logHtml === "string") {
        log.innerHTML = state.logHtml; // keep previous messages
    }

    if (Array.isArray(state.ballStates)) {
        putBallsBack(state.ballStates);
    } else {
        removeAllBallDivs();
    }
}

resetBtn.addEventListener("click", () => {
    leftWeightList = [];
    rightWeightList = [];
    leftDistanceList = [];
    rightDistanceList = [];
    comingWeight = Math.floor(Math.random() * 10 + 1);
    currentAngle = 0;

    leftWeight.innerText = "0.0 kg";
    rightWeight.innerText = "0.0 kg";
    tiltAngle.innerText = "0.0°";
    seesawPlank.style.transform = "translateX(-50%) translateY(-50%) rotate(0deg)";
    log.innerHTML = "";
    nextWeight.innerText = `${comingWeight} kg`;

    localStorage.removeItem("seesawState"); // forget saved session

    removeAllBallDivs(); // wipe balls from screen
});

window.addEventListener("load", bringSavedStuff);
window.addEventListener("resize", () => moveBallsWithBoard()); // keep alignment after window resizes
seesawClickable.addEventListener("click", seesawClick);

function putBallsBack(ballStates) {
    // ballStates comes from localStorage and looks like:
    // { weight, signedDistance, color }
    removeAllBallDivs();

    if (!Array.isArray(ballStates) || !ballStates.length) {
        return;
    }

    const metrics = getPlankBox();

    for (let i = 0; i < ballStates.length; i++) {
        const savedBall = ballStates[i];
        const { weight, signedDistance, color } = savedBall;

        const created = makeBallDiv(weight, color);
        const ball = created.ball;
        const size = created.size;

        // start each ball above the plank, then align it by distance
        ball.style.left = `${metrics.centerX}px`;
        ball.style.top = `${metrics.rect.top - size - 30}px`;
        document.body.appendChild(ball);

        ballInfos.push({
            element: ball,
            signedDistance,
            size,
            weight,
            color,
        });

        ball.style.zIndex = 20 + i;
    }

    requestAnimationFrame(() => moveBallsWithBoard()); // line up with current tilt
}

function makeBallDiv(weight, color) {
    const size = 20 + weight * 5; // bigger weight => bigger circle
    const ball = document.createElement("div");
    ball.classList.add("weight-ball");
    ball.style.width = `${size}px`;
    ball.style.height = `${size}px`;
    ball.style.backgroundColor = color;
    ball.style.display = "flex";
    ball.style.alignItems = "center";
    ball.style.justifyContent = "center";
    ball.style.color = "white";
    ball.style.fontWeight = "bold";
    ball.style.fontSize = "12px";
    ball.innerText = `${weight}kg`;
    ball.dataset.weight = weight;
    return { ball, size };
}

function moveBallsWithBoard(forcedMetrics) {
    // keep balls glued to plank when layout or angle changes
    if (!ballInfos.length) {
        return;
    }

    let metrics;
    if (forcedMetrics && forcedMetrics.centerX !== undefined) {
        metrics = forcedMetrics; // reuse measurement if caller already has it
    } else {
        metrics = getPlankBox();
    }

    const dir = getPlankDirectionNumbers(); // direction maybe small but works

    for (let i = 0; i < ballInfos.length; i++) {
        const record = ballInfos[i];
        const point = findBallCenterPoint(metrics, dir.axisX, dir.axisY, record.signedDistance);
        const newLeft = point.x;
        const newTop = point.y;
        record.element.style.left = `${newLeft}px`;
        record.element.style.top = `${newTop}px`;
        record.element.style.zIndex = 20 + i;
    }
}

function removeAllBallDivs() {
    ballInfos.forEach(record => {
        if (record.element && record.element.remove) {
            record.element.remove();
        }
    });
    ballInfos = []; // now list empty again
}

function getPlankBox() {
    const rect = seesawPlank.getBoundingClientRect(); // read DOM size/position
    return {
        rect,
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
    };
}

function clampDistance(distance) {
    const halfWidth = seesawPlank.offsetWidth / 2; // block drops beyond board edges
    return Math.max(-halfWidth, Math.min(halfWidth, distance));
}

function getRandomColor() {
    return colorOptions[Math.floor(Math.random() * colorOptions.length)]; // pick a random tone
}

function getPlankDirectionNumbers(angleDegrees) {
    const finalAngle = typeof angleDegrees === "number" ? angleDegrees : currentAngle;
    const angleRad = (finalAngle * Math.PI) / 180;
    // convert to simple axis numbers
    return {
        axisX: Math.cos(angleRad),
        axisY: Math.sin(angleRad),
    };
}

function findBallCenterPoint(metrics, axisX, axisY, signedDistance) {
    const result = {
        x: metrics.centerX + signedDistance * axisX,
        y: metrics.centerY + signedDistance * axisY,
    };
    return result; // actual center in pixels
}
