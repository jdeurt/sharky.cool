const cmd = require("node-cmd");
const crypto = require("crypto");
const bufferEq = require("buffer-equal-constant-time");
const bl = require("bl");

// https://developer.github.com/webhooks/
function sign(data) {
    return "sha1=" + crypto.createHmac("sha1", process.env.GIT_SECRET).update(data).digest("hex");
}

function verify(signature, data) {
    return bufferEq(Buffer.from(signature), Buffer.from(sign(data)));
}

module.exports = (req, res) => {
    const sig = req.get("X-Hub-Signature");

    if (!sig) {
        return res.status(400).send("Missing X-Hub-Signature.");
    }
    console.log("X-Hub-Signature present. Proceeding...");

    req.pipe(bl((err, data) => {
        if (err) {
            console.log("Error in webhook handling:", err);
            return res.status(500).send("idk.");
        }

        if (!verify(sig, data)) {
            console.log(">:(");
            return res.status(401).send("X-Hub-Signature does not match blob signature.");
        }

        // Not checking anything but X-Hub-Signature cause if that's right then the rest is irrelevant.
        console.log("Webhook received.");
        cmd.run(`git pull https://${process.env.GIT_USERNAME}:${process.env.GIT_PASSWORD}@github.com/jdeurt/sharky.cool && pm2 restart sharky.cool --update-env`);

        res.send("Received :).")
    }));
};