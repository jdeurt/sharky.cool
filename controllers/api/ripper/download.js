const ytdl = require("youtube-dl");

module.exports = async (req, res) => {
    if (!req.query.url) {
        return res.status(400).send("Missing \"url\" query parameter.");
    }

    const video = ytdl(req.query.url);

    video.on("error", err => {
        res.status(500).send(err.stderr);
    });

    video.on("info", info => {
        res.writeHead(200, {
            "Content-Disposition": `attachment; filename=${info._filename}`
        });
    });

    video.pipe(res);
};