/**
 * Define units.
 */
const minD = window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth;
const maxD = window.innerHeight > window.innerWidth ? window.innerHeight : window.innerWidth;
const bpm = Number(window.location.href.split("#")[1]);
const spb = 60 / bpm;

/**
 * Set up scene.
 */
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/**
 * Add geometry.
 */
class Cube {
    constructor(scene) {
        this._geometry = new THREE.BoxBufferGeometry(0.0045 * minD, 0.0045 * minD, 0.0045 * minD);
        this._edges = new THREE.EdgesGeometry(this._geometry);
        this._ = new THREE.LineSegments(this._edges, new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 0.01 * minD
        }));

        this._.rotation.y = Math.PI / 4;

        scene.add(this._);

        this.tickNum = 0;
        this.rotatingOnY = false;
        this.lastYSnapPos = this._.rotation.y;
    }

    animate() {
        this._.rotation.x += 0.005;

        if (this.onTickMod(60 * spb)) {
            this.rotatingOnY = true;
        }

        if (this.rotatingOnY) {
            if (this._.rotation.y >= this.lastYSnapPos + Math.PI / 4) {
                this.rotatingOnY = false;
                this._.rotation.y = this.lastYSnapPos + Math.PI / 4;
                this.lastYSnapPos = this._.rotation.y;
            } else {
                this._.rotation.y += 0.05;
            }
        }

        this.tickNum++;
    }

    onTickMod(num) {
        console.log(this.tickNum, num);

        if (this.tickNum % num === 0) return true;
        else return false;
    }
}

const cube = new Cube(scene);

/**
 * Render scene as 60fps.
 */
function animate() {
    requestAnimationFrame(animate);

    cube.animate();

    renderer.render(scene, camera);
}
animate();