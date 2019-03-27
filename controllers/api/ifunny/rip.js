const got = require("got");
const cheerio = require("cheerio");

module.exports = (req, res) => {
    const pattern = /ifunny.co\/(fun|video|picture|gif)\/.+/;
    if (!req.query.url || !req.query.url.match(pattern)) {
        return res.status(400).send("Invalid url param.");
    }

    got.get(req.query.url).then(data => {
        const $ = cheerio.load(data.body);

        let props = $(".media__wrapper .media__preview").attr("data-dwhevent-props");
        let src;

        if (!props) {
            src = $(".media__wrapper .media__preview img").attr("data-src");
        } else if (props.includes("contentType=video_clip")) {
            let wrapper = $(".media__wrapper .media__content script").first().html();
            let poster = wrapper.match(/poster=".+?"/)[0];

            src = poster.replace(/_3\.(png|jpg|jpeg)/, "_1.mp4").replace("images", "videos").match(/".+?"/)[0].replace(/"/g, "");
        } else if (props.includes("contentType=gif")) {
            let wrapper = $(".media__wrapper .media__content script").first().html();
            src = wrapper.match(/src=".+?"/)[0].match(/".+?"/)[0].replace(/"/g, "");
        }

        if (req.query.redirect) res.redirect(src);
        res.send(src);
    }).catch(err => {
        console.log(err);

        res.status(400).send("Error contacting iFunny servers. Check your URL.");
    });
};