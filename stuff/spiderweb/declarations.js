/* Declarations */

function init() {
    window.ctx = document.querySelector("canvas").getContext("2d");
}

function resize() {
    const canvas = document.querySelector("canvas");

    window["WIDTH"] = window.innerWidth;
    window["HEIGHT"] = window.innerHeight;

    canvas.setAttribute("width", window.innerWidth);
    canvas.setAttribute("height", window.innerHeight);
}

class Line {
    constructor(xPos, yPos) {
        this.xPos = xPos;
        this.yPos = yPos;
        this.endXPos = this.xPos;
        this.endYPos = this.yPos;
        this.rotation = 0;

        ctx.strokeStyle = "white";
        ctx.lineWidth = 3;
    }

    _reset() {
        ctx.strokeStyle = "black";
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(this.xPos, this.yPos);
        ctx.lineTo(this.endXPos, this.endYPos);
        ctx.closePath();
        ctx.stroke();

        ctx.strokeStyle = "white";
    }

    getLength() {
        return Math.sqrt(
            Math.pow(this.endXPos - this.xPos, 2)
            + Math.pow(this.endYPos - this.yPos, 2)
        );
    }

    getPos() {
        return {
            start: {
                x: this.xPos,
                y: this.yPos
            },
            end: {
                x: this.endXPos,
                y: this.endYPos
            }
        };
    }

    getRotation() {
        return this.rotation * (180 / Math.PI);
    }

    setRotationRel(relDegrees) {
        const relRadians = relDegrees * (Math.PI / 180);

        this.rotation = this.rotation + relRadians;

        return this;
    }

    setRotation(degrees) {
        this.rotation = degrees * (Math.PI / 180);

        return this;
    }

    draw(xDistance, yDistance) {
        this._reset();

        this.endXPos += xDistance;
        this.endYPos += yDistance;

        ctx.beginPath();
        ctx.moveTo(this.xPos, this.yPos);
        ctx.lineTo(this.endXPos, this.endYPos);
        ctx.closePath();
        ctx.stroke();

        return this;
    }

    drawFromRot(distance) {
        this._reset();

        const xDistance = Math.cos(this.rotation) * distance;
        const yDistance = Math.sin(this.rotation) * distance;

        this.draw(xDistance, yDistance);

        return this;
    }

    moveRel(xDistance, yDistance) {
        this._reset();

        this.xPos += xDistance;
        this.yPos += yDistance;
        this.endXPos += xDistance;
        this.endYPos += yDistance;

        ctx.beginPath();
        ctx.moveTo(this.xPos, this.yPos);
        ctx.lineTo(this.endXPos, this.endYPos);
        ctx.closePath();
        ctx.stroke();

        return this;
    }
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}