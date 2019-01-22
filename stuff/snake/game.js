let urlParams = new URLSearchParams(window.location.search);
let score;

let MS_PER_TICK = urlParams.get("ms");
let BLOCK_AMT = urlParams.get("blocks");
let STARTING_SIZE = urlParams.get("size");

if(!MS_PER_TICK) MS_PER_TICK = 50;
else MS_PER_TICK = parseInt(MS_PER_TICK);
if(!BLOCK_AMT) BLOCK_AMT = 25;
else BLOCK_AMT = parseInt(BLOCK_AMT);
if(!STARTING_SIZE) STARTING_SIZE = 3;
else STARTING_SIZE = parseInt(STARTING_SIZE);

const WIDTH = document.body.clientWidth;
const HEIGHT = document.body.clientHeight;
const USING = WIDTH > HEIGHT ? HEIGHT : WIDTH;
const BLOCK = {
    width: USING / BLOCK_AMT,
    height: USING / BLOCK_AMT
}

let app = new PIXI.Application(USING, USING, {
    backgroundColor: 0x000000
});
document.body.appendChild(app.view);

// create board
let board = {
    calculatePosition: (x, y) => {
        if (board["" + x] && board["" + x]["" + y]) {
            return {
                x: board["" + x]["" + y].rawX,
                y: board["" + x]["" + y].rawY
            };
        } else {
            return null;
        }
    }
};
for (let x = 0; x < BLOCK_AMT; x++) {
    board["" + x] = {};
    for (let y = 0; y < BLOCK_AMT; y++) {
        board["" + x]["" + y] = {
            rawX: BLOCK.width * x,
            rawY: BLOCK.height * y
        };
    }
}

// create game
let game = {
    paused: false,
    dimmed: false,
    food: {
        coords: {
            x: 0,
            y: 0
        },
        sprite: {},
        generate: (x, y) => {
            let calculatedPosition = board.calculatePosition(x, y);
            game.food.sprite = new PIXI.Sprite(PIXI.Texture.WHITE);
            game.food.sprite.width = BLOCK.width;
            game.food.sprite.height = BLOCK.height;
            game.food.sprite.x = calculatedPosition.x;
            game.food.sprite.y = calculatedPosition.y;
            game.food.sprite.tint = 0xFF4136;
            app.stage.addChild(game.food.sprite);

            game.food.coords.x = x;
            game.food.coords.y = y;
        },
        move: (x, y) => {
            let calculatedPosition = board.calculatePosition(x, y);

            game.food.sprite.x = calculatedPosition.x;
            game.food.sprite.y = calculatedPosition.y;

            game.food.coords.x = x;
            game.food.coords.y = y;
        }
    },
    setup: () => {
        score = new PIXI.Text("0", {
            fontFamily: "Calibri",
            fontSize: USING,
            fill: 0xFFFFFF,
            align: "center"
        });
        score.alpha = 0.05;
        score.anchor.set(0.5);
        score.x = USING / 2;
        score.y = USING / 2;
        app.stage.addChild(score);
        game.food.generate(getRandomInt(2, BLOCK_AMT - 3), getRandomInt(2, BLOCK_AMT - 3));
        for (let i = 0; i < game.snake.size; i++) {
            game.snake.addBlock(Math.floor(BLOCK_AMT / 2) + i, Math.floor(BLOCK_AMT / 2));
        }
    },
    reset: () => {
        app.stage.removeChildren();
        game.snake.blocks = [];
        game.paused = false;
        game.dimmed = false;
        game.food.sprite = {};
        game.snake.queuedIncrease = false;
        game.snake.queuedDirection = "L";
        game.snake.direction = "L";
        game.setup();
    },
    snake: {
        blocks: [],
        size: STARTING_SIZE,
        queuedIncrease: false,
        queuedDirection: "L",
        direction: "L",
        setDirection: direction => {
            if (!["D", "L", "U", "R"].includes(direction)) return;
            let snakeDir = game.snake.direction;
            if ((direction == "D" || direction == "U") && (snakeDir != "D" && snakeDir != "U")) game.snake.queuedDirection = direction;
            if ((direction == "L" || direction == "R") && (snakeDir != "L" && snakeDir != "R")) game.snake.queuedDirection = direction;
        },
        increaseSize: () => {
            game.snake.queuedIncrease = true;
        },
        checkCollision(x, y, mode = "<") {
            if (x === null) {
                if (mode == "<" && game.snake.blocks[0].pos.y < y) return true;
                else if (mode == ">" && game.snake.blocks[0].pos.y > y) return true;
                return false;
            } else if (y === null) {
                if (mode == "<" && game.snake.blocks[0].pos.x < x) return true;
                else if (mode == ">" && game.snake.blocks[0].pos.x > x) return true;
                return false;
            } else {
                if (game.snake.blocks[0].pos.x == x && game.snake.blocks[0].pos.y == y) return true;
                return false;
            }
        },
        addBlock: (x, y) => {
            let snakeBlock = new PIXI.Sprite(PIXI.Texture.WHITE);
            snakeBlock.width = BLOCK.width;
            snakeBlock.height = BLOCK.height;
            snakeBlock.alpha = 0;
            game.snake.blocks.push({
                sprite: snakeBlock,
                pos: {
                    x: x,
                    y: y
                }
            });
            app.stage.addChild(snakeBlock);
        },
        tick: () => {
            if (game.paused) {
                $("canvas").css({
                    opacity: "0.7"
                });
                game.dimmed = true;
                return;
            }
            if(game.dimmed) {
                $("canvas").removeAttr("style");
                game.dimmed = false;
            }

            if (game.snake.queuedDirection != game.snake.direction) game.snake.direction = game.snake.queuedDirection;

            if (game.snake.direction == "D")
                for (let i = game.snake.blocks.length - 1; i >= 0; i--) {
                    if (i == 0) {
                        game.snake.blocks[0].pos.y++;
                    } else {
                        if (game.snake.queuedIncrease) {
                            game.snake.addBlock(game.snake.blocks[i].pos.x, game.snake.blocks[i].pos.y);
                            game.snake.queuedIncrease = false;
                        }
                        game.snake.blocks[i].pos.x = game.snake.blocks[i - 1].pos.x;
                        game.snake.blocks[i].pos.y = game.snake.blocks[i - 1].pos.y;
                    }
                }
            if (game.snake.direction == "L")
                for (let i = game.snake.blocks.length - 1; i >= 0; i--) {
                    if (i == 0) {
                        game.snake.blocks[0].pos.x--;
                    } else {
                        if (game.snake.queuedIncrease) {
                            game.snake.addBlock(game.snake.blocks[i].pos.x, game.snake.blocks[i].pos.y);
                            game.snake.queuedIncrease = false;
                        }
                        game.snake.blocks[i].pos.x = game.snake.blocks[i - 1].pos.x;
                        game.snake.blocks[i].pos.y = game.snake.blocks[i - 1].pos.y;
                    }
                }
            if (game.snake.direction == "U")
                for (let i = game.snake.blocks.length - 1; i >= 0; i--) {
                    if (i == 0) {
                        game.snake.blocks[0].pos.y--;
                    } else {
                        if (game.snake.queuedIncrease) {
                            game.snake.addBlock(game.snake.blocks[i].pos.x, game.snake.blocks[i].pos.y);
                            game.snake.queuedIncrease = false;
                        }
                        game.snake.blocks[i].pos.x = game.snake.blocks[i - 1].pos.x;
                        game.snake.blocks[i].pos.y = game.snake.blocks[i - 1].pos.y;
                    }
                }
            if (game.snake.direction == "R")
                for (let i = game.snake.blocks.length - 1; i >= 0; i--) {
                    if (i == 0) {
                        game.snake.blocks[0].pos.x++;
                    } else {
                        if (game.snake.queuedIncrease) {
                            game.snake.addBlock(game.snake.blocks[i].pos.x, game.snake.blocks[i].pos.y);
                            game.snake.queuedIncrease = false;
                        }
                        game.snake.blocks[i].pos.x = game.snake.blocks[i - 1].pos.x;
                        game.snake.blocks[i].pos.y = game.snake.blocks[i - 1].pos.y;
                    }
                }

            for (let i = game.snake.blocks.length - 1; i >= 0; i--) {
                let coords = board.calculatePosition(game.snake.blocks[i].pos.x, game.snake.blocks[i].pos.y);
                if (!coords) break;

                if (i == 0) {
                    if (game.snake.blocks[0].pos.x == game.food.coords.x && game.snake.blocks[0].pos.y == game.food.coords.y) {
                        game.food.move(getRandomInt(2, BLOCK_AMT - 3), getRandomInt(2, BLOCK_AMT - 3));
                        game.snake.increaseSize();
                        score.text = parseInt(score.text) + 1;
                        score.style = {
                            fontSize: USING / score.text.length,
                            fontFamily: "Calibri",
                            fill: 0xFFFFFF,
                            align: "center"
                        };
                        document.title = "Score: " + score.text;
                    }
                }

                game.snake.blocks[i].sprite.x = coords.x;
                game.snake.blocks[i].sprite.y = coords.y;

                if (game.snake.blocks[i].sprite.alpha == 0) game.snake.blocks[i].sprite.alpha = 1;
            }

            let isColliding = false;
            if (game.snake.checkCollision(null, 0, "<") || game.snake.checkCollision(0, null, "<") || game.snake.checkCollision(null, BLOCK_AMT - 1, ">") || game.snake.checkCollision(BLOCK_AMT - 1, null, ">")) {
                isColliding = true;
            }
            game.snake.blocks.forEach((block, index) => {
                if (index != 0 && game.snake.checkCollision(block.pos.x, block.pos.y)) isColliding = true;
            });
            if (isColliding) game.reset();
        }
    }
}

key("w, up", () => {
    game.snake.setDirection("U");
    return false;
});
key("a, left", () => {
    game.snake.setDirection("L");
    return false;
});
key("s, down", () => {
    game.snake.setDirection("D");
    return false;
});
key("d, right", () => {
    game.snake.setDirection("R");
    return false;
});
key("esc, space", () => {
    game.paused = !game.paused;
    return false;
})

window.setInterval(() => {
    game.snake.tick();
}, MS_PER_TICK);

$(window).blur(() => {
    game.paused = true;
}).focus(() => {
    game.paused = false;
});

game.setup();