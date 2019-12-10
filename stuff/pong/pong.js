const scoreboard = {
    scores: {
        leftVal: 0,
        rightVal: 0,
        leftElem: document.getElementById("score-left"),
        rightElem: document.getElementById("score-right")
    },
    charges: {
        leftWidth: 0,
        rightWidth: 0,
        leftElem: document.getElementById("cb-left"),
        rightElem: document.getElementById("cb-right")
    }
};

//get DPI
let dpi = window.devicePixelRatio;

/**
 * @type {HTMLCanvasElement}
 */
let canvas = document.getElementById("play-area");
//get context
let ctx = canvas.getContext("2d");

function fix_dpi() {
    //get CSS height
    //the + prefix casts it to an integer
    //the slice method gets rid of "px"
    let style_height = +getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
    //get CSS width
    let style_width = +getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);
    //scale the canvas
    canvas.setAttribute("height", style_height * dpi);
    canvas.setAttribute("width", style_width * dpi);
}

fix_dpi();

const playArea = {
    left: 0,
    right: window.innerWidth,
    top: 0,
    bottom: window.innerHeight
};

const keys = {};
window.onkeyup = function (e) {
    keys[e.key] = false;
}
window.onkeydown = function (e) {
    keys[e.key] = true;
}

const gameCanvas = new GameCanvas(canvas);

const leftPaddle = new Paddle(gameCanvas, {
    x: 0,
    y: 0,
    width: 10,
    height: 50
});
const rightPaddle = new Paddle(gameCanvas, {
    x: 0,
    y: 0,
    width: 10,
    height: 50
});
const ball = new Ball(gameCanvas, {
    x: 0,
    y: 0,
    width: 15,
    height: 15
});

leftPaddle.setPos({
    x: 10,
    y: playArea.bottom / 2 - leftPaddle.dimensions.height / 2
});

rightPaddle.setPos({
    x: playArea.right - 10 - rightPaddle.dimensions.width,
    y: playArea.bottom / 2 - rightPaddle.dimensions.height / 2
});

ball.setPos({
    x: playArea.right / 2 - ball.dimensions.width / 2,
    y: playArea.bottom / 2 - ball.dimensions.height / 2
});

const ballSpeedData = {
    multiplier: 1,
    speeds: {
        west: (multiplier) => {
            return -3 * multiplier;
        },
        east: (multiplier) => {
            return 3 * multiplier;
        },
        north: (multiplier) => {
            return -3 * multiplier;
        },
        south: (multiplier) => {
            return 3 * multiplier;
        }
    },
    currentSpeed: {
        x: 0,
        y: 0
    }
};

setRandomBallDirection();

function setRandomBallDirection() {
    const val = Math.floor(Math.random() * 4 + 1);

    if (val == 1) {
        ballSpeedData.currentSpeed = {
            x: ballSpeedData.speeds.east(ballSpeedData.multiplier),
            y: ballSpeedData.speeds.north(ballSpeedData.multiplier)
        };
    } else if (val == 2) {
        ballSpeedData.currentSpeed = {
            x: ballSpeedData.speeds.west(ballSpeedData.multiplier),
            y: ballSpeedData.speeds.north(ballSpeedData.multiplier)
        };
    } else if (val == 3) {
        ballSpeedData.currentSpeed = {
            x: ballSpeedData.speeds.west(ballSpeedData.multiplier),
            y: ballSpeedData.speeds.south(ballSpeedData.multiplier)
        };
    } else if (val == 4) {
        ballSpeedData.currentSpeed = {
            x: ballSpeedData.speeds.east(ballSpeedData.multiplier),
            y: ballSpeedData.speeds.south(ballSpeedData.multiplier)
        };
    }
}

function handleControls(now) {
    if (keys["w"]) {
        leftPaddle.setPos({
            y: leftPaddle.pos.y - 5
        });
    } else if (keys["s"]) {
        leftPaddle.setPos({
            y: leftPaddle.pos.y + 5
        });
    }

    if (keys["d"] && leftPaddle.lastChargeShotRelease < now - 3000) {
        leftPaddle.lastChargeShotRelease = now;
        scoreboard.charges.leftElem.style.background = "#FFFFFF";
    }

    if (keys["ArrowUp"]) {
        rightPaddle.setPos({
            y: rightPaddle.pos.y - 5
        });
    } else if (keys["ArrowDown"]) {
        rightPaddle.setPos({
            y: rightPaddle.pos.y + 5
        });
    }

    if (keys["ArrowLeft"] && rightPaddle.lastChargeShotRelease < now - 3000) {
        rightPaddle.lastChargeShotRelease = now;
        scoreboard.charges.rightElem.style.background = "#FFFFFF";
    }
}

function handlePaddlePlayAreaCollision() {
    if (leftPaddle.hitbox.top <= playArea.top) {
        leftPaddle.setPos({
            y: playArea.top
        });
    } else if (leftPaddle.hitbox.bottom >= playArea.bottom) {
        leftPaddle.setPos({
            y: playArea.bottom - leftPaddle.dimensions.height
        });
    }

    if (rightPaddle.hitbox.top <= playArea.top) {
        rightPaddle.setPos({
            y: playArea.top
        });
    } else if (rightPaddle.hitbox.bottom >= playArea.bottom) {
        rightPaddle.setPos({
            y: playArea.bottom - rightPaddle.dimensions.height
        });
    }
}

function handleBallPaddleCollision(now) {
    if (ball.isCollidingWith(leftPaddle)) {
        ballSpeedData.multiplier += 0.15;

        if (leftPaddle.lastChargeShotRelease >= now - 100) {
            ballSpeedData.multiplier *= 1.1;

            scoreboard.charges.leftElem.style.background = "#FF4136";
        }

        ballSpeedData.currentSpeed = {
            x: ballSpeedData.speeds.east(ballSpeedData.multiplier),
            y: (
                ballSpeedData.currentSpeed.y < 0
                    ? ballSpeedData.speeds.north(ballSpeedData.multiplier)
                    : ballSpeedData.speeds.south(ballSpeedData.multiplier)
            )
        };
    } else if (ball.isCollidingWith(rightPaddle)) {
        ballSpeedData.multiplier += 0.15;

        if (rightPaddle.lastChargeShotRelease >= now - 100) {
            ballSpeedData.multiplier += 0.15;

            scoreboard.charges.rightElem.style.background = "#FF4136";
        }

        ballSpeedData.currentSpeed = {
            x: ballSpeedData.speeds.west(ballSpeedData.multiplier),
            y: (
                ballSpeedData.currentSpeed.y < 0
                    ? ballSpeedData.speeds.north(ballSpeedData.multiplier)
                    : ballSpeedData.speeds.south(ballSpeedData.multiplier)
            )
        };
    }
}

function handleBallPlayAreaCollision() {
    if (ball.hitbox.top <= playArea.top) {
        ballSpeedData.currentSpeed = {
            x: ballSpeedData.currentSpeed.x,
            y: ballSpeedData.currentSpeed.y * -1
        };
    } else if (ball.hitbox.bottom >= playArea.bottom) {
        ballSpeedData.currentSpeed = {
            x: ballSpeedData.currentSpeed.x,
            y: ballSpeedData.currentSpeed.y * -1
        };
    }
}

function handleBallScored() {
    if (ball.hitbox.left <= playArea.left) {
        scoreboard.scores.rightVal++;
        scoreboard.scores.rightElem.textContent = scoreboard.scores.rightVal;

        ball.setPos({
            x: playArea.right / 2 - ball.dimensions.width / 2,
            y: playArea.bottom / 2 - ball.dimensions.height / 2
        });

        ballSpeedData.multiplier = 1;

        setRandomBallDirection();
    } else if (ball.hitbox.left >= playArea.right) {
        scoreboard.scores.leftVal++;
        scoreboard.scores.leftElem.textContent = scoreboard.scores.leftVal;

        ball.setPos({
            x: playArea.right / 2 - ball.dimensions.width / 2,
            y: playArea.bottom / 2 - ball.dimensions.height / 2
        });

        ballSpeedData.multiplier = 1;

        setRandomBallDirection();
    }
}

function handleBallMovement() {
    ball.setPos({
        x: ball.pos.x + ballSpeedData.currentSpeed.x,
        y: ball.pos.y + ballSpeedData.currentSpeed.y
    });
}

function animate() {
    const now = Date.now();

    handleControls(now);
    handlePaddlePlayAreaCollision(now);
    handleBallPaddleCollision(now);
    handleBallPlayAreaCollision(now);
    handleBallScored(now);
    handleBallMovement(now);

    /* Paddle charge shot animation */

     if (leftPaddle.lastChargeShotRelease >= now - 3000) {
        const msSinceRelease = now - leftPaddle.lastChargeShotRelease;

        if (msSinceRelease <= 100) {
            leftPaddle.setPos({
                x: 10 + msSinceRelease / 100 * 10
            });

            scoreboard.charges.leftWidth = msSinceRelease;
        } else {
            leftPaddle.setPos({
                x: 20 - msSinceRelease / 3000 * 10
            });

            scoreboard.charges.leftWidth = 100 - msSinceRelease / 3000 * 100;
        }
    } else {
        leftPaddle.setPos({
            x: 10
        });

        scoreboard.charges.leftWidth = 0;
    }

    if (rightPaddle.lastChargeShotRelease >= now - 3000) {
        const msSinceRelease = now - rightPaddle.lastChargeShotRelease;
        const originalXPos = playArea.right - 10 - rightPaddle.dimensions.width;

        if (msSinceRelease <= 100) {
            rightPaddle.setPos({
                x: originalXPos - msSinceRelease / 100 * 10
            });

            scoreboard.charges.rightWidth = msSinceRelease;
        } else {
            rightPaddle.setPos({
                x: originalXPos - 10 + msSinceRelease / 3000 * 10
            });

            scoreboard.charges.rightWidth = 100 - msSinceRelease / 3000 * 100;
        }
    } else {
        rightPaddle.setPos({
            x: playArea.right - 10 - rightPaddle.dimensions.width
        });

        scoreboard.charges.rightWidth = 0;
    }

    scoreboard.charges.leftElem.style.width = `${scoreboard.charges.leftWidth}%`;
    scoreboard.charges.rightElem.style.width = `${scoreboard.charges.rightWidth}%`;

    gameCanvas.clear();

    leftPaddle.draw();
    rightPaddle.draw();
    ball.draw();

    window.requestAnimationFrame(animate);
}

window.requestAnimationFrame(animate);