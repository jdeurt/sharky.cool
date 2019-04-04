function spawn(x = window.app.screen.width / 2, y = window.app.screen.height / 2) {
    let color = parseInt(randomColor().replace("#", "0x"));

    let circle = new PIXI.Sprite(PIXI.Texture.WHITE);
        circle.tint = color;
        circle.width = 0;
        circle.height = 0;
        circle.anchor.set(0.5);
        circle.x = x;
        circle.y = y;

    window.app.stage.addChild(circle);

    let count = 0;

    window.data.objects.push({
        circle,
        count,
        color
    });
}