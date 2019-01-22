const express = require("express");
const bodyParser = require("body-parser");
const marked = require("marked");
const fs = require("fs");
const dotenv = require("dotenv");
const controllers = require("./controllers");

dotenv.load();
process.env.LAST_COMMIT_ID = fs.readFileSync(".git/refs/heads/master", "utf8").trim();

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

app.get(/[\w-_]+\.(py|bat)$/, (req, res, next) => {
    res.header("Content-Type", "text");

    next();
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
app.get("/api/files/download", controllers.api.files.download);

app.get("*", (req, res) => {
    const dir = __dirname + req.originalUrl;

    if (!fs.existsSync(dir)) return res.status(404).send("Oops! Looks like you took a wrong turn somewhere.<br><a href=\"https://sharky.cool\">Take me back.</a>");

    const isDirectory = src => fs.lstatSync(src).isDirectory();

    const subDirs = fs.readdirSync(dir).filter(src => !src.startsWith("."));

    const folders = subDirs.filter(src => isDirectory(dir + src)).sort((a, b) => a.toLowerCase() - b.toLowerCase());
    const files = subDirs.filter(src => !isDirectory(dir + src)).sort((a, b) => a.toLowerCase() - b.toLowerCase()).map(src => {
        // Kinda like sym links except for the web.
        if (src.startsWith("REDIR_")) return "//" + src.replace("REDIR_", "");
        else return src;
    });

    res.render("views/directory.pug", {
        folders,
        files,
        path: req.originalUrl,
        lastCommitID: process.env.LAST_COMMIT_ID
    });
});

module.exports = app;