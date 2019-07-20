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
        const avatarUrl = `https://cdn.discordapp.com/avatars/${req.params.id}/${data.body.avatar}${data.body.avatar.startsWith("a_") ? ".gif" : ".png?size=2048"}`;

        res.redirect(avatarUrl);
    }).catch(err => {
        res.status(500).send("Error retrieving avatar.");
    });
};