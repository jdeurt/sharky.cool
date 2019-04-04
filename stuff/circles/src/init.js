const customCSS = "body { background-color: #000000 }";
const customStyle = document.createElement("style");

if (customStyle.styleSheet) {
    customStyle.styleSheet.cssText = customCSS;
} else {
    customStyle.appendChild(document.createTextNode(customCSS));
}

document.getElementsByTagName("head")[0].appendChild(customStyle);

window.data = {
    objects: []
};