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

// Redirects
app.get("/git/:repo", (req, res) => {
    res.redirect(301, "https://github.com/jdeurt/" + repo);
});

app.get("*", (req, res) => {
    const dir = __dirname + req.originalUrl;

    if (!fs.existsSync(dir)) return res.status(404).send("Oops! Looks like you took a wrong turn somewhere.<br><a href=\"https://sharky.cool\">Take me back.</a>");

    const isDirectory = src => fs.lstatSync(src).isDirectory();

    const subDirs = fs.readdirSync(dir).filter(src => !src.startsWith("."));

    const folders = subDirs.filter(src => isDirectory(dir + src)).sort((a, b) => a.toLowerCase() - b.toLowerCase());
    const files = subDirs.filter(src => !isDirectory(dir + src)).sort((a, b) => a.toLowerCase() - b.toLowerCase());



    res.render("views/directory.pug", {
        folders,
        files,
        path: req.originalUrl
    });
});

module.exports = app;