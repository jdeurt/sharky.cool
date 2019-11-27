function readSingleFile(evt) {
    const f = evt.target.files[0];

    document.getElementById("output").setAttribute("placeholder", "Shrinking file...");

    if (f) {
        const r = new FileReader();
        r.onload = function (e) {
            const contents = e.target.result;
            const lines = contents.split("\n");
            const finalLines = [];

            if (!lines[0].match(/^L \d+\/\d+\/\d+ - \d+:\d+:\d+: Log file started/)) {
                document.getElementById("output").innerHTML = "[INVALID LOG FILE]";

                return;
            }

            for (let line of lines) {
                const matchSay = line.match(/>" say "/);
                const matchConnected = line.match(/>" connected, address "/);
                const matchValidated = line.match(/>" STEAM USERID validated$/);
                const matchAmmoPackCollected = line.match(/>" picked up item "tf_ammo_pack"$/);
                const matchSmallAmmoPackCollected = line.match(/>" picked up item "ammopack_small"$/);
                const matchMediumAmmoPackCollected = line.match(/>" picked up item "ammopack_medium"$/);

                if (
                    matchSay === null &&
                    matchConnected === null &&
                    matchValidated === null &&
                    matchAmmoPackCollected === null &&
                    matchSmallAmmoPackCollected === null &&
                    matchMediumAmmoPackCollected === null
                ) {
                    finalLines.push(line);
                }
            }

            document.getElementById("output").innerHTML = finalLines.join("\n");
        }
        r.readAsText(f);
    } else {
        document.getElementById("output").innerHTML = "[INVALID LOG FILE]";

        alert("Failed to load file");
    }
}

document.getElementById("file-upload").addEventListener("change", readSingleFile, false);