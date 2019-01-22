const WIDTH = document.body.clientWidth;
const HEIGHT = document.body.clientHeight;
const USING = WIDTH > HEIGHT ? HEIGHT : WIDTH;
const BLOCK = {
    width: USING / 20,
    height: USING / 20
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
for (let x = 0; x < 50; x++) {
    board["" + x] = {};
    for (let y = 0; y < 50; y++) {
        board["" + x]["" + y] = {
            rawX: BLOCK.width * x,
            rawY: BLOCK.height * y
        };
    }
}

// create game
let game = {
    paused: false,
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
    snake: {
        blocks: [],
        size: 3,
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
            if (game.paused) return;

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
                        game.food.move(getRandomInt(2, 17), getRandomInt(2, 17));
                        game.snake.increaseSize();
                        score.text = parseInt(score.text) + 1;
                        score.style = {
                            fontSize: USING / score.text.length,
                            fontFamily: "Calibri",
                            fill: 0xFFFFFF,
                            align: "center"
                        };
                    }
                }

                game.snake.blocks[i].sprite.x = coords.x;
                game.snake.blocks[i].sprite.y = coords.y;

                if (game.snake.blocks[i].sprite.alpha == 0) game.snake.blocks[i].sprite.alpha = 1;
            }

            let isColliding = false;
            if (game.snake.checkCollision(null, 0, "<") || game.snake.checkCollision(0, null, "<") || game.snake.checkCollision(null, 19, ">") || game.snake.checkCollision(19, null, ">")) {
                isColliding = true;
            }
            game.snake.blocks.forEach((block, index) => {
                if (index != 0 && game.snake.checkCollision(block.pos.x, block.pos.y)) isColliding = true;
            });
            if (isColliding) location.reload();
        }
    }
}

let score = new PIXI.Text("0", {
    fontFamily: "Calibri",
    fontSize: USING,
    fill: 0xFFFFFF,
    align: "center"
});
score.alpha = 0.1;
score.anchor.set(0.5);
score.x = USING / 2;
score.y = USING / 2;
app.stage.addChild(score);
game.food.generate(getRandomInt(2, 17), getRandomInt(2, 17));
for (let i = 0; i < game.snake.size; i++) {
    game.snake.addBlock(15 + i, 10);
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

window.setInterval(() => {
    game.snake.tick();
}, 150);

$(window).blur(() => {
    game.paused = true;
}).focus(() => {
    game.paused = false;
});

// touch controls
let hammer = new Hammer(document.body);
hammer.on("panleft", () => {
    game.snake.setDirection("L");
});
hammer.on("panright", () => {
    game.snake.setDirection("R");
});
hammer.on("panup", () => {
    game.snake.setDirection("U");
});
hammer.on("pandown", () => {
    game.snake.setDirection("D");
});