// ==UserScript==
// @name         Nope
// @namespace    https://sharky.cool
// @version      1.3
// @description  Now with hover reveals!
// @author       Juan de Urtubey
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    "use strict";

    let nopeHoverStyleCSS = ".__nope:hover { opacity: 0 }";
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
        let nopeStyle = "; transition: opacity 0.5s; position: absolute!important; top: 0; left: 0;";

        nopeImg.classList.add("__nope");
        nopeImg.src = "https://i.sharky.cool/nope.jpg";
        nopeImg.
        nopeImg.style = !!imgElem.style ? imgElem.style + nopeStyle : nopeStyle;

        let container = document.createElement("div");
        container.className = "__nope-container";
        container.style = !!imgElem.style ? imgElem.style + "; position: relative!important;" : "; position: relative!important;";
        container.appendChild(imgElem.cloneNode());
        container.appendChild(nopeImg);

        imgElem.parentNode.insertBefore(container, imgElem.nextSibling);
        imgElem.parentNode.removeChild(imgElem);
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