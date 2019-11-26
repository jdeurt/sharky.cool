function readSingleFile(evt) {
    var f = evt.target.files[0];

    if (f) {
        const r = new FileReader();
        r.onload = function (e) {
            const contents = e.target.result;
            const lines = contents.split("\n");
            const finalLines = [];

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
        alert("Failed to load file");
    }
}

document.getElementById("file-upload").addEventListener("change", readSingleFile, false);