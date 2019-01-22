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

// Make sure to handle directories.pug
app.get("/views/directory.pug", (req, res) => {
    res.redirect(301, "/");
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

app.use(express.static(__dirname));

// Controllers
app.post("/api/gitpushed", controllers.api.git.pushed);

app.get("*", (req, res) => {
    const dir = __dirname + req.originalUrl;
    const isDirectory = src => fs.lstatSync(src).isDirectory();

    res.render("views/directory.pug", {
        dir: fs.readdirSync(dir).filter(src => !src.startsWith(".")).map(src => {
            return {
                relativePath: src,
                isDirectory: isDirectory(dir + src)
            };
        }),
        path: req.originalUrl
    });
});

module.exports = app;