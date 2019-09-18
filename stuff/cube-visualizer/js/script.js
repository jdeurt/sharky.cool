/**
 * Define stuff.
 */
const minD = window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth;
const maxD = window.innerHeight > window.innerWidth ? window.innerHeight : window.innerWidth;
let bpm = 60;
let spb = 1;
let beats = [];
const clock = new THREE.Clock();

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

    bpm = mt.tempo;
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
                linewidth: 0.01 * minD
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
            const time = clock.getElapsedTime();

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

            this._.rotation.x += 0.003 * bpm / 60;
            //this._.rotation.y += 0.003 * bpm / 60;
            this._.rotation.y += 0.2 * Math.max(0, trebleLoudness - 1);
            console.log(trebleLoudness);

            /*
            if (time >= beats[0]) {
                this.rotatingOnY = true;
                beats = beats.slice(1);
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
            */

            this._.scale.x = bassLoudness;
            this._.scale.y = bassLoudness;
            this._.scale.z = bassLoudness;

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
                linewidth: 0.01 * minD
            });
        }
    }

    const cube = new Cube(scene);
    clock.start();

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