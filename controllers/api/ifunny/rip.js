const got = require("got");
const cheerio = require("cheerio");

module.exports = (req, res) => {
    const pattern = /ifunny.co\/(fun|video|picture|gif)\/.+/;
    if (!req.query.url || !req.query.url.match(pattern)) {
        return res.status(400).send("Invalid url param.");
    }

    console.log("Matched pattern.");

    got.get(req.query.url).then(data => {
        const $ = cheerio.load(data.body);

        console.log("Loaded into cheerio.");

        let wrapper = $(".media__wrapper .media__content script").html();
        let poster = wrapper.match(/poster=".+?"/)[0].replace(/_3\.(png|jpg|jpeg)/, "_1.mp4").replace("images", "videos");
        console.log(poster);

        res.send(poster.match(/".+?"/)[0].replace(/"/g, ""));
    }).catch(err => {
        console.log(err);

        res.status(400).send("Error contacting iFunny servers. Check your URL.");
    });
};