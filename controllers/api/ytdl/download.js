const ytdl = require("ytdl-core");

module.exports = (req, res) => {
    if (!req.body.url) return res.status(400).send("Missing url parameter.");

    console.log(req.body.url, req.body.mp3);
};