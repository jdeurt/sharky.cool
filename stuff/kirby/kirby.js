let urlParams = new URLSearchParams(window.location.search);

const ANIMATION_SPEED = parseFloat(urlParams.get("speed") || "0.5");
const KIRBY_SIZE = parseFloat(urlParams.get("size") || "1");
const BPM = parseFloat(urlParams.get("bpm") || "130");

const app = new PIXI.Application(window.innerWidth, window.innerHeight, {backgroundColor : 0x000000});
document.body.appendChild(app.view);

let frames = [];
for(let i = 0; i < 15; i++) {
	frames.push(PIXI.Texture.from(`assets/frame_${i}.png`));
}

let kirby = new PIXI.extras.AnimatedSprite(frames);

kirby.x = app.screen.width / 2;
kirby.y = app.screen.height / 2;
kirby.anchor.set(0.5);
kirby.animationSpeed = bpmToGifSpeed(BPM);
kirby.width = kirby.width * KIRBY_SIZE;
kirby.height = kirby.height * KIRBY_SIZE;
kirby.play();

app.stage.addChild(kirby);