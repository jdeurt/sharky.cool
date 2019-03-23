(function() {
    if (!window["key"]) return console.log("Keymaster dependency not found. Exiting...");

    key("shift+k", function() {
        let kirbContainer = document.createElement("div");
        let kirb = document.createElement("img");

        kirb.src = "https://i.sharky.cool/kirby.gif";

        kirbContainer.style = "position: absolute; bottom: 0; left: 0; z-index: 100;";
        kirbContainer.appendChild(kirb);

        document.body.appendChild(kirbContainer);
    });
})();