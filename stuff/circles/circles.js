const loadData = window.location.href.split("#");

const SPEED = Number(loadData.length > 1 ? loadData[1] : 100);

const app = new PIXI.Application({
    autoResize: true,
    resolution: devicePixelRatio,
    antialias: true,
    transparent: true
});
document.body.appendChild(app.view);

let data = {
    objects: [],
    covering: 0
};

window.setInterval(function() {
    let color = parseInt(randomColor().replace("#", "0x"));

    let circle = new PIXI.Sprite(PIXI.Texture.WHITE);
        circle.tint = color;
        circle.width = 0;
        circle.height = 0;
        circle.anchor.set(0.5);
        circle.x = app.screen.width / 2;
        circle.y = app.screen.height / 2;

    app.stage.addChild(circle);

    let count = 0;

    data.objects.push({
        circle,
        count,
        color,
        isCovering: false
    });
}, 500);

app.ticker.add(function(delta) {
    data.objects.forEach((object, index) => {
        if (object.circle.width > app.screen.width + 500 && object.circle.height > app.screen.height + 500) {
            if (!object.isCovering) {
                data.covering++;
                object.isCovering = true;
            }

            if (data.covering > 2) {
                app.stage.removeChild(object.circle);
                data.objects.splice(index, 1);
                data.covering--;
            }
        }

        object.count += 0.1;
        let count = object.count;

        object.circle.width = count * SPEED;
        object.circle.height = count * SPEED;
        object.circle.rotation = count * 0.1;
    });
});

window.addEventListener('resize', resize);

function resize() {
	app.renderer.resize(window.innerWidth, window.innerHeight);
}

resize();