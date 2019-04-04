resize();

if (!window.CONTROLLED) {
    createTimer(bpmToMs(window.BPM), function() {
        spawn();

        return true;
    });
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

window.app.ticker.add(function(delta) {
    data.objects.forEach((object, index) => {
        if (object.circle.width > app.screen.width * 2 + 500 && object.circle.height > app.screen.height * 2 + 500) {
            customStyle.innerHTML = `body { background-color: #${object.color.toString(16)} }`;
            app.stage.removeChild(object.circle);
            data.objects.splice(index, 1);

            return;
        }

        object.count += 0.1;
        let count = object.count;

        object.circle.width = count * SPEED;
        object.circle.height = count * SPEED;
        object.circle.rotation = count * 0.1;
    });
});