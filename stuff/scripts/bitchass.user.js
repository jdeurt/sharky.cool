// ==UserScript==
// @name         Bitch Ass
// @namespace    https://sharky.cool
// @version      0.1
// @description  Bitch ass
// @author       Juan de Urtubey
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
    "use strict";

    function replaceTextInElement(elements = new HTMLAllCollection()) {
        let elementArray = [...elements];

        elementArray.forEach(element => {
            if (element.className.includes("__bn")) return;
            if (element.childNodes.length !== 1 || element.childNodes[0].nodeName != "#text") return;

            let matches = element.textContent.split(/\b/);

            element.textContent = matches.map(match => match.replace(/\w+/g, Math.random() >= 0.5 ? "bitch" : "ass")).join("");
            element.classList.add("__bn");
        });
    }

    function get(name = "") {
        return document.getElementsByTagName(name);
    }

    setInterval(function() {
        let supportedElements = [
            "p",
            "code",
            "a",
            "span",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "li",
            "td",
            "th",
            "b",
            "div",
            "em"
        ];

        supportedElements.forEach(element => {
            replaceTextInElement(
                get(element)
            );
        });
    }, 100);
})();