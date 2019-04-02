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
        color
    });
}, 500);

app.ticker.add(function(delta) {
    data.objects.forEach((object, index) => {
        if (object.circle.width > app.screen.width + 100 && object.circle.height > app.screen.height + 100) {
            data.covering++;

            if (data.covering > 1) {
                app.stage.removeChild(object.circle);
                data.objects.splice(index, 1);
                data.covering--;
            }
        }

        object.count += 0.1;
        let count = object.count;

        object.circle.width = count * 100;
        object.circle.height = count * 100;
        object.circle.rotation = count * 0.1;
    });
});

window.addEventListener('resize', resize);

function resize() {
	app.renderer.resize(window.innerWidth, window.innerHeight);
}

resize();