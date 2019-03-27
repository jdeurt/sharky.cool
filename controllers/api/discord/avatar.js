const got = require("got");

// /discord/avatar/:id
module.exports = (req, res) => {
    if (!req.params.id) {
        return res.status(400).send("Missing id param.");
    }

    got.get("https://discordapp.com/api/v6/users/" + req.params.id, {
        headers: {
            "Authorization": `Bot ${process.env.DISCORD_TOKEN}`
        },
        json: true
    }).then(data => {
        const base = `https://cdn.discordapp.com/avatars/${req.params.id}/${data.body.avatar}`;

        got.head(base + ".gif", {
            throwHttpErrors: false
        }).then(data => {
            if (data.statusCode == 200) res.redirect(base + ".gif");
            else if (data.statusCode == 415) res.redirect(base + ".png");
            else throw new Error("Unhandled status code.");
        });
    }).catch(err => {
        res.status(500).send("Error retrieving avatar.");
    });
};