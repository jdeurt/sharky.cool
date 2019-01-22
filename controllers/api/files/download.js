const fs = require("fs");
const path = require("path");

module.exports = (req, res) => {
    if (!req.query.path) {
        return res.status(400).send("Missing path param.");
    }

    const getFile = filePath => {
        try {
            filePath = path.join(path.resolve("."), filePath);
            return (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile() ? filePath : false);
        } catch (err) {
            return false;
        }
    };

    if (!getFile(req.query.path)) {
        return res.status(400).send("Not a valid file path.");
    }

    res.download(getFile(req.query.path));
};