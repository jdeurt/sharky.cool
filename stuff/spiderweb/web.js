init();

resize();

const rotations = {
    topLeft: 45,
    topRight: 135,
    bottomLeft: -45,
    bottomRight: -135
};

const lines = {
    topLeft: new Line(0, 0),
    top: new Line(WIDTH / 2, 0),
    topRight: new Line(WIDTH, 0),
    right: new Line(WIDTH, HEIGHT / 2),
    bottomLeft: new Line(0, HEIGHT),
    bottom: new Line(WIDTH / 2, HEIGHT),
    bottomRight: new Line(WIDTH, HEIGHT),
    left: new Line(0, HEIGHT / 2)
};

lines.topLeft.setRotation(45);
lines.top.setRotation(90);
lines.topRight.setRotation(135);
lines.right.setRotation(180);
lines.bottomLeft.setRotation(-45);
lines.bottom.setRotation(-90);
lines.bottomRight.setRotation(-135);
lines.left.setRotation(0);

window.setInterval(() => {
    for (let lineId in lines) {
        const target = lines[lineId];
        const length = target.getLength();
        const position = target.getPos();
        const rotation = target.getRotation();

        if (length >= 100) {
            if (position.end.x < 0 || position.end.y < 0 || position.end.x > WIDTH || position.end.y > HEIGHT) {
                target.setRotation(rotation - 179);
            }

            const possibleRotations = [-45, -30, -15, 15, 30, 45];
            const relativeRotation = possibleRotations[random(0, possibleRotations.length - 1)];

            const oldRotation = target.getRotation();
            const oldPos = target.getPos();

            lines[lineId] = new Line(oldPos.end.x, oldPos.end.y);
            lines[lineId].setRotation(oldRotation + relativeRotation);
        }

        target.drawFromRot(1);
    }
}, 1);