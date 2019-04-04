function stage() {
    const app = new PIXI.Application({
        autoResize: true,
        resolution: devicePixelRatio,
        antialias: true,
        transparent: true
    });

    document.body.appendChild(app.view);

    return app;
}

window.app = stage();