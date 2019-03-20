const express = require("express");
const bodyParser = require("body-parser");
const marked = require("marked");
const fs = require("fs");
const dotenv = require("dotenv");
const controllers = require("./controllers");

dotenv.load();
process.env.LAST_COMMIT_ID = (fs.readFileSync(".git/refs/heads/master", "utf8") || "ERROR").trim();

const app = express();

app.set("views", __dirname);
app.set("view engine", "pug");

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use((req, res, next) => {
    req.url = req.originalUrl.replace(/^\/s\b/, "/stuff");
    next();
});

// Make sure to handle directories.pug
app.get("/views/directory.pug", (req, res) => {
    res.redirect(301, "/");
});

// File rules
app.all(/\/\./, (req, res) => {
    res.status(401).send("No.");
});
app.get(/[\w-_]+\.(py|bat)$/, (req, res, next) => {
    res.header("Content-Type", "text");

    next();
});
app.get(/[\w-_]+\.pug$/, (req, res) => {
    res.render("." + req.url);
});
app.get(/[\w-_]+\.md$/, (req, res) => {
    const path = __dirname + req.url;
    const file = fs.readFileSync(path, "utf8");

    res.send(marked(file));
});
app.get(/_RAW$/, (req, res) => {
    res.sendFile(__dirname + req.url.replace(/_RAW$/, ""));
});

app.get(/\/_$/, (req, res) => {
    const relativePath = req.url.replace(/\/_$/, "");
    const path = __dirname + relativePath;

    if (fs.existsSync(`${path}/index.html`)) {
        res.sendFile(`${path}/index.html`);
    } else if (fs.existsSync(`${path}/index.pug`)) {
        res.sendFile(`${path}/index.pug`);
    } else {
        res.redirect(301, relativePath);
    }
});

app.use(express.static(__dirname, {
    index: false
}));

// Controllers
app.post("/api/gitpushed", controllers.api.git.pushed);
app.get("/api/files/download", controllers.api.files.download);
app.get("/api/tamuhack/mock", controllers.api.tamuhack.mock);
app.post("/api/tamuhack/mock", controllers.api.tamuhack.mock);
app.get("/api/tamuhack/data", controllers.api.tamuhack.data);
app.post("/api/tamuhack/data", controllers.api.tamuhack.data);
app.get("/api/spider/crawl", controllers.api.spider.crawl);

app.get("*", (req, res) => {
    const dir = __dirname + req.url;

    if (!fs.existsSync(dir)) return res.status(404).send("Oops! Looks like you took a wrong turn somewhere.<br><a href=\"https://sharky.cool\">Take me back.</a>");

    const isDirectory = src => fs.lstatSync(src).isDirectory();

    const subDirs = fs.readdirSync(dir).filter(src => !src.startsWith("."));

    const folders = subDirs.filter(src => isDirectory(dir + src)).sort((a, b) => a.toLowerCase() - b.toLowerCase());
    const files = subDirs.filter(src => !isDirectory(dir + src) && !src.startsWith("REDIR_")).sort((a, b) => a.toLowerCase() - b.toLowerCase());
    const redirs = subDirs.filter(src => !isDirectory(dir + src) && src.startsWith("REDIR_")).sort((a, b) => a.toLowerCase() - b.toLowerCase()).map(src => {
        return "//" + src.replace("REDIR_", "").replace(/%s/g, "/");
    });

    res.render("views/directory.pug", {
        folders,
        files,
        redirs,
        path: req.url,
        lastCommitID: process.env.LAST_COMMIT_ID
    });
});

module.exports = app;