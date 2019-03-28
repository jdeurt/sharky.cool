// ==UserScript==
// @name         Nope
// @namespace    https://sharky.cool
// @version      0.1
// @description  nope
// @author       Juan de Urtubey
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    "use strict";

    function nope(imgElem = new HTMLImageElement()) {
        if (imgElem.className.includes("__nope")) return;

        imgElem.classList.add("__nope");
        imgElem.src = "https://i.sharky.cool/nope.jpg";
    } 

    function loopElements(elements = new HTMLAllCollection(), cb) {
        let elementArray = [...elements];

        elementArray.forEach(element => {
            cb(element);
        });
    }

    setInterval(function() {
        loopElements(document.getElementsByTagName("img"));
    }, 500);
})();