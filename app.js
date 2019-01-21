const express = require("express");
const bodyParser = require("body-parser");
const marked = require("marked");
const fs = require("fs");
const dotenv = require("dotenv");
const controllers = require("./controllers");

dotenv.load();

const app = express();

app.set("views", __dirname);
app.set("view engine", "pug");

app.use(bodyParser.urlencoded({
    extended: false
}));

app.all(/\/\./, (req, res) => {
    res.status(401).send("No.");
});

app.get(/[\w-_]+\.pug$/, (req, res) => {
    res.render(req.originalUrl);
});
app.get(/[\w-_]+\.md$/, (req, res) => {
    const path = __dirname + req.originalUrl;
    const file = fs.readFileSync(path, "utf8");

    res.send(marked(file));
});
app.get(/_RAW$/, (req, res) => {
    res.sendFile(__dirname + req.originalUrl.replace(/_RAW$/, ""));
});

app.get(/[\w-_]+\.\w+$/, (req, res, next) => {
    res.header("Content-Type", "text");

    next();
});

app.use(express.static(__dirname));

// Controllers
app.post("/gitpushed", controllers.api.git.pushed);

app.get("*", (req, res) => {
    const dir = __dirname + req.originalUrl;

    res.render("views/directory.pug", {
        dirs: fs.readdirSync(dir).filter(dir => !dir.startsWith("."))
    });
});

module.exports = app;