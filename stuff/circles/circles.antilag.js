let customCSS = "body { background-color: #000000 }";
let customStyle = document.createElement("style");

if (customStyle.styleSheet) {
    customStyle.styleSheet.cssText = customCSS;
} else {
    customStyle.appendChild(document.createTextNode(customCSS));
}

document.getElementsByTagName("head")[0].appendChild(customStyle);

const loadData = window.location.href.split("#");

const SPEED = Number(loadData.length > 1 ? loadData[1] : 100);
const CONTROLLED = loadData.length > 2 ? !!loadData[2] : false;

const app = new PIXI.Application({
    autoResize: true,
    resolution: devicePixelRatio,
    antialias: true,
    transparent: true
});
document.body.appendChild(app.view);

let data = {
    objects: []
};

if (!CONTROLLED) {
    window.setInterval(spawn, 500);
} else {
    document.body.onkeydown = function(e) {
        if (e.keyCode == 32){
            spawn();
        }
    }

    document.body.onmousedown = function(e) {
        spawn(e.clientX, e.clientY);
    };

    document.body.ontouchstart = function(e) {
        try {
            const touch = e.touches[i];

            spawn(touch.clientX, touch.clientY);
        } catch (err) {
            spawn();
        }
    };
}

app.ticker.add(function(delta) {
    data.objects.forEach((object, index) => {
        if (object.circle.width > app.screen.width && object.circle.height > app.screen.height) {
            customStyle.innerHTML = `body { background-color: #${object.color.toString(16)} }`;
            app.stage.removeChild(object.circle);
            data.objects.splice(index, 1);

            return;
        }

        object.count += 0.1;
        let count = object.count;

        object.circle.width = count * SPEED;
        object.circle.height = count * SPEED;
    });
});

function spawn(x = app.screen.width / 2, y = app.screen.height / 2) {
    let color = parseInt(randomColor().replace("#", "0x"));

    let circle = new PIXI.Sprite(PIXI.Texture.WHITE);
        circle.tint = color;
        circle.width = 0;
        circle.height = 0;
        circle.anchor.set(0.5);
        circle.x = x;
        circle.y = y;

    app.stage.addChild(circle);

    let count = 0;

    data.objects.push({
        circle,
        count,
        color
    });
}

window.addEventListener('resize', resize);

function resize() {
	app.renderer.resize(window.innerWidth, window.innerHeight);
}

resize();