/**
 * @typedef {object} Hitbox
 * @property {number} left
 * @property {number} right
 * @property {number} top
 * @property {number} bottom
 */

/**
 * @typedef {object} Pos
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {object} Dimensions
 * @property {number} width
 * @property {number} height
 */

class GameCanvas {
    /**
     * Creates a new GameCanvas class
     * @param {HTMLCanvasElement} canvas 
     */
    constructor(canvas) {
        this._canvas = canvas;
        this._ctx = this._canvas.getContext("2d");
        this._ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    /**
     * Clears the canvas
     */
    clear() {
        this._ctx.fillStyle = "#000000";
        this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
    }

    /**
     * Draws a white rectangle on the canvas
     * @param {number} x 
     * @param {number} y 
     * @param {number} width 
     * @param {number} height 
     */
    drawRect(x, y, width, height) {
        this._ctx.fillStyle = "#FFFFFF";
        this._ctx.fillRect(x, y, width, height);
    }

    /**
     * Draws a white circle on the canvas
     * @param {number} x 
     * @param {number} y 
     * @param {number} diameter 
     */
    drawCircle(x, y, diameter) {
        this._ctx.beginPath();
        this._ctx.arc(x + diameter / 2, y + diameter / 2, diameter / 2, 0, 2 * Math.PI, false);
        this._ctx.fillStyle = "#FFFFFF";
        this._ctx.fill();
    }
}

class GameObject {
    /**
     * @typedef {object} GameObjectArguments
     * @property {number} x
     * @property {number} y
     * @property {number} width
     * @property {number} height
     */

    /**
     * Creates a GameObject class
     * @param {GameObjectArguments} gameObjectArguments 
     */
    constructor({
        x,
        y,
        width,
        height
    }) {
        /**
         * @type {Hitbox}
         */
        this.hitbox = {
            left: x,
            right: x + width,
            top: y,
            bottom: y + height
        };

        /**
         * @type {Pos}
         */
        this.pos = {
            x,
            y
        };

        /**
         * @type {Dimensions}
         */
        this.dimensions = {
            width,
            height
        };
    }

    /**
     * Checks to see if GameObject is colliding with another GameObject
     * @param {GameObject | Hitbox} gameObjectOrHitbox
     */
    isCollidingWith(gameObjectOrHitbox) {
        const targetHitbox = gameObjectOrHitbox.hitbox || gameObjectOrHitbox;

        if (this.hitbox.left <= targetHitbox.right && this.hitbox.right >= targetHitbox.left) {
            if (this.hitbox.top <= targetHitbox.bottom && this.hitbox.bottom >= targetHitbox.top) {
                return true;
            }
        }

        return false
    }

    /**
     * Updates this GameObject's hitbox
     */
    updateHitbox() {
        this.hitbox = {
            left: this.pos.x,
            right: this.pos.x + this.dimensions.width,
            top: this.pos.y,
            bottom: this.pos.y + this.dimensions.height
        };

        return this;
    }

    /**
     * Updates this GameObject's position
     * @param {Partial<Pos>} newPos 
     */
    setPos(newPos) {
        this.pos = {
            ...this.pos,
            ...newPos
        };

        this.updateHitbox();

        return this;
    }
}

class Paddle extends GameObject {
    /**
     * Creates a Paddle class
     * @param {GameCanvas} canvas 
     * @param {GameObjectArguments} gameObjectArguments 
     */
    constructor(canvas, {
        x,
        y,
        width,
        height
    }) {
        super({
            x,
            y,
            width,
            height
        });

        this._canvas = canvas;

        this.isChargingShot = false;
        this.chargedShotPower = 0; // %
        this.lastChargeShotRelease = 0;
    }

    /**
     * Draws this Paddle on the canvas
     */
    draw() {
        this._canvas.drawRect(this.pos.x, this.pos.y, this.dimensions.width, this.dimensions.height);
    }
}

class Ball extends GameObject {
    /**
     * Creates a Ball class
     * @param {GameCanvas} canvas 
     * @param {GameObjectArguments} gameObjectArguments 
     */
    constructor(canvas, {
        x,
        y,
        width,
        height
    }) {
        super({
            x,
            y,
            width,
            height
        });

        if (this.dimensions.width !== this.dimensions.height) {
            throw new Error("Ball width and height dimensions must be equal.");
        }

        this._canvas = canvas;
    }

    /**
     * Draws this Ball on the canvas
     */
    draw() {
        this._canvas.drawCircle(this.pos.x, this.pos.y, this.dimensions.width);
    }
}