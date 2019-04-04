window.addEventListener("resize", resize);

function resize() {
	window.app.renderer.resize(window.innerWidth, window.innerHeight);
}