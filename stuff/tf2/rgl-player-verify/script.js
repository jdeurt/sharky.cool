(function() {
    document.getElementById("input-form").addEventListener("submit", async function (event) {
        event.preventDefault();

        document.querySelector("#output tbody").innerHTML = "";

        const inputText = document.getElementById("input").value;
        const inputData = inputText.split("\n");

        for (let i = 0; i < inputData.length; i++) {
            const line = inputData[i];

            const match = line.match(/^# +(\d+) +"(.+)" +(\[.+\])/);

            if (match === null) {
                continue;
            }

            const userId = match[1];
            const steamIdOld = match[3];

            const res = await fetch(`https://sharky.cool/api/rgl/player/${steamIdOld}`);
            const data = await res.json();

            const experience = data.experience;

            addTableRow(userId, data.steamId, data.name, data.verified, experience);

            updateProgBar(i + 1, inputData.length);
        }
    });

    function addTableRow(userId, steamId, name, verified, experience) {
        const table = document.querySelector("#output tbody");

        const naHlExperience = experience.filter(exp => exp.category == "highlander" && exp.format == "hl north america");

        const rglName = name || "<i class=\"fas fa-exclamation-triangle\"></i>";
        const verifiedStr = verified === true ? " <i class=\"far fa-check-circle\"></i>" : "";
        const lastDiv = naHlExperience.length > 0 ? naHlExperience[0].div : "<i class=\"fas fa-exclamation-triangle\"></i>";
        const lastTeam = naHlExperience.length > 0 ? naHlExperience[0].team : "<i class=\"fas fa-exclamation-triangle\"></i>";
        const lastPlacement = naHlExperience.length > 0 ? naHlExperience[0].endRank : "<i class=\"fas fa-exclamation-triangle\"></i>";

        const htmlContent = `<th scope="row">${userId}</th><td><a href="https://steamcommunity.com/profiles/${steamId}">${steamId}</a></td><td><a href="http://rgl.gg/Public/PlayerProfile.aspx?p=${steamId}">${rglName}${verifiedStr}</a></td><td>${lastDiv}</td><td>${lastTeam}</td><td>${lastPlacement}</td>`;

        const rowElement = document.createElement("tr");
        rowElement.innerHTML = htmlContent;

        table.appendChild(rowElement);
    };

    function updateProgBar(current = 0, total = 100) {
        const bar = document.querySelector("#prog .progress-bar");

        const percent = Math.round(current / total * 100);

        bar.setAttribute("aria-valuenow", percent);
        bar.style.width = `${percent}%`;
    }
})();