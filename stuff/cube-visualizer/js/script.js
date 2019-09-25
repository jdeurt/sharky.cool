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
 * The Metro class. Used for simplifying the analyzing process for music.
 */
class Metro {

    /**
     * Creates a Metro object.
     * @param {Blob} audioFile - The audio file to analyze.
     */
    constructor(audioFile) {
        /**
        * @type {AudioContext}
        */
        this._audioContext = new (window.AudioContext || window.webkitAudioContext)();

        /**
        * @type {AudioBufferSourceNode}
        */
        this._source = {};

        /**
        * @type {AnalyserNode}
        */
        this._analyzer = this._audioContext.createAnalyser();
        this._analyzer.smoothingTimeConstant = 1;
        this._analyzer.fftSize = 2048;

        /**
        * @type {Uint8Array}
        */
        this.frequencyData = new Uint8Array(this._analyzer.frequencyBinCount);

        const reader = new FileReader();
        reader.onload = () => {
            this._audioContext.decodeAudioData(reader.result, (buffer) => {
                this._source = this._audioContext.createBufferSource();
                this._source.buffer = buffer;
        
                this._source.connect(this._analyzer);
                this._analyzer.connect(this._audioContext.destination);
        
                this._doEventCallback("ready");
            });
        };
        reader.readAsArrayBuffer(audioFile);

        this._callbacks = {
            ready: []
        };
    }

    /**
     * Internal function to trigger an event.
     * @param {"ready"} eventName 
     */
    _doEventCallback(eventName) {
        this._callbacks[eventName].forEach(callback => {
            callback();
        });
    }

    /**
     * Adds a callback for an event.
     * @param {"ready"} eventName 
     * @param {Function} callback 
     */
    on(eventName, callback) {
        this._callbacks[eventName].push(callback);
    }

    start() {
        this._source.start();
    }

    pause() {
        this._audioContext.suspend();
    }

    resume() {
        this._audioContext.resume();
    }

    stop() {
        this._source.stop();
    }

    updateFrequencyData() {
        this._analyzer.getByteTimeDomainData(this.frequencyData);
    }

    getFrequencyData() {
        this.updateFrequencyData();

        let subBassTotal = 0;
        let bassTotal = 0;
        let trebleTotal = 0;

        for (let i = 0; i < 256; i++) {
            subBassTotal += this.frequencyData[i];
        }
        for (let i = 0; i < 512; i++) {
            bassTotal += this.frequencyData[i];
            trebleTotal += this.frequencyData[512 + i];
        }

        let subBassAvg = subBassTotal / 256;
        let bassAvg = bassTotal / 512;
        let trebleAvg = trebleTotal / 512;

        let subBassLoudness = subBassAvg / 128;
        let bassLoudness = bassAvg / 128;
        let trebleLoudness = trebleAvg / 128;

        return {
            avg: {
                sub: subBassAvg,
                bass: bassAvg,
                treble: trebleAvg
            },
            loudness: {
                sub: subBassLoudness,
                bass: bassLoudness,
                treble: trebleLoudness
            }
        };
    }
}

document.getElementById("audio-file").addEventListener("change", function () {
    if (this.files.length == 0) return;

    document.getElementById("status-msg").innerHTML = "File received! Analyzing...";

    const metro = new Metro(this.files[0]);
    metro.on("ready", () => {
        document.getElementById("status-msg").style = "display: none;";
        document.getElementById("play-btn").style = "";

        document.getElementById("play-btn").onclick = function () {
            document.getElementById("play-btn").style = "display: none;";

            const minD = window.innerHeight < window.innerWidth ? window.innerHeight : window.innerWidth;

            const scene = new THREE.Scene();

            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            camera.position.z = 5;

            const renderer = new THREE.WebGLRenderer();
            renderer.setSize(window.innerWidth, window.innerHeight);

            document.body.appendChild(renderer.domElement);

            const cubeGeometryDimension = 0.003 * minD;
            const cubeGeometry = new THREE.BoxGeometry(
                cubeGeometryDimension,
                cubeGeometryDimension,
                cubeGeometryDimension
            );

            const cubeEdges = new THREE.EdgesGeometry(cubeGeometry);

            const cubeMaterial = new THREE.LineBasicMaterial({
                color: 0xffffff,
                linewidth: 10,
                transparent: true,
                opacity: 1
            });

            const cube = new THREE.LineSegments(cubeEdges, cubeMaterial);
            cube.rotation.y = Math.PI / 4;
            cube.scale.set(1, 1, 1);

            function setCubeColor(color) {
                cube.material = new THREE.LineBasicMaterial({
                    color,
                    linewidth: 10,
                    transparent: true,
                    opacity: 1
                });
            }

            scene.add(cube);

            let cubeShadowExpanding = false;
            let cubeShadow = {};

            function animate() {
                requestAnimationFrame(animate);

                const fData = metro.getFrequencyData();
                fData.loudness.bass = ( (fData.avg.bass - 128) / 2 + 128 ) / 128;

                if (fData.loudness.bass > 1.1) {
                    setCubeColor(RAINBOW[6]);
                    renderer.setClearColor(RAINBOW[0], 1);
                } else if (fData.loudness.bass > 1.09) {
                    setCubeColor(RAINBOW[5]);
                    renderer.setClearColor(RAINBOW[1], 1);
                } else if (fData.loudness.bass > 1.08) {
                    setCubeColor(RAINBOW[4]);
                    renderer.setClearColor(RAINBOW[2], 1);
                } else if (fData.loudness.bass > 1.07) {
                    setCubeColor(RAINBOW[3]);
                    renderer.setClearColor(RAINBOW[3], 1);
                } else if (fData.loudness.bass > 1.06) {
                    setCubeColor(RAINBOW[2]);
                    renderer.setClearColor(RAINBOW[4], 1);
                } else if (fData.loudness.bass > 1.05) {
                    setCubeColor(RAINBOW[1]);
                    renderer.setClearColor(0x000000, 1);
                } else if (fData.loudness.bass > 1.03) {
                    setCubeColor(RAINBOW[0]);
                    renderer.setClearColor(0x000000, 1);
                } else {
                    setCubeColor(0xFFFFFF);
                    renderer.setClearColor(0x000000, 1);
                }

                if (fData.loudness.sub > 1.3) {
                    if (!cubeShadowExpanding) {
                        cubeShadowExpanding = true;
                        cubeShadow = cube.clone();
                        cubeShadow.material = cubeShadow.material.clone();

                        scene.add(cubeShadow);
                    }
                }

                if (cubeShadowExpanding) {
                    if (cubeShadow.scale.x > 3) {
                        scene.remove(cubeShadow);
                        cubeShadow = {};
                        cubeShadowExpanding = false;
                    } else {
                        cubeShadow.scale.x += 0.1;
                        cubeShadow.scale.y += 0.1;
                        cubeShadow.scale.z += 0.1;
                        cubeShadow.material.opacity -= 0.03333333;
                    }
                }

                const baseSpeed = 0.003 * 120 / 60;
                cube.rotation.x += baseSpeed;
                cube.rotation.y += baseSpeed + 0.2 * Math.max(0, fData.loudness.treble - 1);

                cube.scale.x = fData.loudness.bass;
                cube.scale.y = fData.loudness.bass;
                cube.scale.z = fData.loudness.bass;

                renderer.render(scene, camera);
            }
            animate();

            metro.start();
        };
    });

    window.addEventListener("keypress", function (ev) {
        if (ev.keyCode == 32) {
            window["PLAYING"] = !window["PLAYING"];
    
            if (window["PLAYING"]) {
                metro.pause();
            } else {
                metro.resume();
            }
        }
    });
});