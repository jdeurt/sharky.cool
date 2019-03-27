(function() {
    "use strict";

    function replaceTextInElement(elements = new HTMLAllCollection()) {
        let elementArray = [...elements];

        elementArray.forEach(element => {
            if (element.className.includes("__bn")) return;

            let matches = element.textContent.split(/\b/);

            element.textContent = matches.map(match => match.replace(/\w+/g, Math.random() >= 0.5 ? "bitch" : "nigga")).join("");
            element.classList.add("__bn");
        });
    }

    function get(name = "") {
        return document.getElementsByTagName(name);
    }

    setInterval(function() {
        let p = get("p");
        let a = get("a");
        let span = get("span");
        let h1 = get("h1");
        let h2 = get("h2");
        let h3 = get("h3");
        let h4 = get("h4");
        let h5 = get("h5");
        let h6 = get("h6");

        replaceTextInElement(p);
        replaceTextInElement(a);
        replaceTextInElement(span);
        replaceTextInElement(h1);
        replaceTextInElement(h2);
        replaceTextInElement(h3);
        replaceTextInElement(h4);
        replaceTextInElement(h5);
        replaceTextInElement(h6);
    }, 500);
})();