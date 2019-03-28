// ==UserScript==
// @name         Nope
// @namespace    https://sharky.cool
// @version      1.0
// @description  Now with hover reveals!
// @author       Juan de Urtubey
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    "use strict";

    let nopeHoverStyleCSS = ".__nope { position: absolute!important } .__nope:hover { opacity: 0 } .__nope-container: { position: relative }";
    let nopeHoverStyle = document.createElement('style');

    if (nopeHoverStyle.styleSheet) {
        nopeHoverStyle.styleSheet.cssText = nopeHoverStyleCSS;
    } else {
        nopeHoverStyle.appendChild(document.createTextNode(nopeHoverStyleCSS));
    }

    document.getElementsByTagName("head")[0].appendChild(nopeHoverStyle);

    function nope(imgElem = new HTMLImageElement()) {
        if (imgElem.className.includes("__nope")) return;

        imgElem.classList.add("__nope");

        let nopeImg = imgElem.cloneNode();

        nopeImg.classList.add("__nope");
        nopeImg.src = "https://i.sharky.cool/nope.jpg";
        nopeImg.style = imgElem.style ? imgElem.style + ";transition: opacity 0.5s;" : ";transition: opacity 0.5s;";

        let container = document.createElement("div");
        container.className = "__nope-container";
        container.appendChild(imgElem.cloneNode());
        container.appendChild(nopeImg);

        imgElem.parentNode.insertBefore(container, imgElem.nextSibling);
    }

    function loopElements(elements = new HTMLAllCollection(), cb) {
        let elementArray = [...elements];

        elementArray.forEach(element => {
            cb(element);
        });
    }

    setInterval(function() {
        loopElements(document.getElementsByTagName("img"), nope);
    }, 100);
})();