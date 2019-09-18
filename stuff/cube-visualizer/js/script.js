/**
 * Define stuff.
 */
const minD = window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth;
const maxD = window.innerHeight > window.innerWidth ? window.innerHeight : window.innerWidth;
let bpm = 60;
let spb = 1;

const RAINBOW = [
    0x800080,
    0x0000FF,
    0x00FFFF,
    0x008000,
    0xFFFF00,
    0xFFA500,
    0xFF0000
];

/**
 * Define globals.
 */

/**
 * @type {AudioContext}
 */
let audioContext = new(window.AudioContext || window.webkitAudioContext)();

/**
 * @type {AudioBufferSourceNode}
 */
let source;

/**
 * @type {AnalyserNode}
 */
let analyzer = audioContext.createAnalyser();
analyzer.smoothingTimeConstant = 1;
analyzer.fftSize = 2048;

/**
 * @type {Uint8Array}
 */
let frequencyDataArray = new Uint8Array(analyzer.frequencyBinCount);

document.getElementById("audio-file").addEventListener("change", function () {
    if (this.files.length == 0) return;

    document.getElementById("status-msg").innerHTML = "File received! Analyzing...";

    const reader = new FileReader();

    reader.onload = function () {
        audioContext.decodeAudioData(this.result, handleAudioBuffer);
    }

    reader.readAsArrayBuffer(this.files[0]);
});

function handleAudioBuffer(buffer) {
    source = audioContext.createBufferSource(buffer);
    source.buffer = buffer;
    source.connect(analyzer);
    analyzer.connect(audioContext.destination);

    const audioData = [];
    // Take the average of the two channels
    if (buffer.numberOfChannels == 2) {
        const channel1Data = buffer.getChannelData(0);
        const channel2Data = buffer.getChannelData(1);
        const length = channel1Data.length;
        for (let i = 0; i < length; i++) {
            audioData[i] = (channel1Data[i] + channel2Data[i]) / 2;
        }
    } else {
        audioData = buffer.getChannelData(0);
    }

    const mt = new MusicTempo(audioData);

    bpm = mt.tempo / 4;
    spb = 60 / bpm;
    beats = mt.beats;

    document.getElementById("status-msg").style = "display: none;";

    document.getElementById("play-btn").style = "";
}

document.getElementById("play-btn").onclick = function () {
    document.getElementById("play-btn").style = "display: none;";

    source.start(0);

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
            this._geometry = new THREE.BoxBufferGeometry(0.003 * minD, 0.003 * minD, 0.003 * minD);
            this._edges = new THREE.EdgesGeometry(this._geometry);
            this._ = new THREE.LineSegments(this._edges, new THREE.LineBasicMaterial({
                color: 0xffffff,
                linewidth: 0.03 * minD
            }));

            this._.rotation.y = Math.PI / 4;
            this._.scale.set(1, 1, 1);

            scene.add(this._);

            this.tickNum = 0;
            this.rotatingOnY = false;
            this.lastYSnapPos = this._.rotation.y;

            this.expanding = false;
            this.contracting = false;
        }

        animate() {
            analyzer.getByteTimeDomainData(frequencyDataArray);

            let bassTotal = 0;
            let trebleTotal = 0;
            for (let i = 0; i < 512; i++) {
                bassTotal += frequencyDataArray[i];
                trebleTotal += frequencyDataArray[512 + i];
            }
            let bassAverage = bassTotal / 512;
            let trebleAverage = trebleTotal / 512;
            let bassLoudness = ( (bassAverage - 128) / 2 + 128 ) / 128;
            let trebleLoudness = trebleAverage / 128;

            let baseSpeed = 0.003 * bpm / 60;
            this._.rotation.x += baseSpeed;
            this._.rotation.y += baseSpeed + 0.2 * Math.max(0, trebleLoudness - 1);

            this._.scale.x = bassLoudness;
            this._.scale.y = bassLoudness;
            this._.scale.z = bassLoudness;

            if (bassLoudness > 1.1) {
                this.setColor(RAINBOW[6]);
                renderer.setClearColor(RAINBOW[0], 1);
            } else if (bassLoudness > 1.09) {
                this.setColor(RAINBOW[5]);
                renderer.setClearColor(RAINBOW[1], 1);
            } else if (bassLoudness > 1.08) {
                this.setColor(RAINBOW[4]);
                renderer.setClearColor(RAINBOW[2], 1);
            } else if (bassLoudness > 1.07) {
                this.setColor(RAINBOW[3]);
                renderer.setClearColor(RAINBOW[3], 1);
            } else if (bassLoudness > 1.06) {
                this.setColor(RAINBOW[2]);
                renderer.setClearColor(RAINBOW[4], 1);
            } else if (bassLoudness > 1.05) {
                this.setColor(RAINBOW[1]);
                renderer.setClearColor(0x000000, 1);
            } else if (bassLoudness > 1.03) {
                this.setColor(RAINBOW[0]);
                renderer.setClearColor(0x000000, 1);
            } else {
                this.setColor(0xFFFFFF);
                renderer.setClearColor(0x000000, 1);
            }

            this.tickNum++;
        }

        onTickMod(num) {
            const mod = this.tickNum % num;

            if (mod < 1 && mod > -1) return true;
            else return false;
        }

        setColor(color) {
            this._.material = new THREE.LineBasicMaterial({
                color,
                linewidth: 0.03 * minD
            });
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
};