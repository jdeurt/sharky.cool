(function() {
    window.keys = {};

    document.onkeydown = function(ev) {
        ev = ev || window.event;

        if (ev.keyCode == 16) {
            window.keys.SHIFT = true;
            return;
        }

        if (ev.keyCode == 75) {
            window.keys.K = true;
            
            if (window.keys.SHIFT) spawnKirb();
        }
    };

    document.onkeyup = function(ev) {
        ev = ev || window.event;

        if (ev.keyCode == 16) {
            window.keys.SHIFT = false;
            return;
        }

        if (ev.keyCode == 75) {
            window.keys.K = false;
        }
    };

    function spawnKirb() {
        if (document.getElementById("spawned-kirb")) document.body.removeChild(document.getElementById("spawned-kirb"));

        let kirbContainer = document.createElement("div");
        let kirb = document.createElement("img");

        kirb.src = "https://i.sharky.cool/kirby.gif";

        kirbContainer.style = "position: absolute; bottom: 0; left: 0; z-index: 100;";
        kirbContainer.id = "spawned-kirb"
        kirbContainer.appendChild(kirb);

        document.body.appendChild(kirbContainer);
    }
})();