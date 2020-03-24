const { bufferFromUrl } = require("./helpers/youtube-dl");

module.exports = async (req, res) => {
    if (!req.query.url) {
        return res.status(400).send("Missing \"url\" query parameter.");
    }

    const videoBuffer = await bufferFromUrl(req.query.url);

    res.writeHead(200, {
        "Content-Disposition": "attachment; filename=video.mp4",
        "Content-Type": "video/mp4"
    }).send(videoBuffer);
};