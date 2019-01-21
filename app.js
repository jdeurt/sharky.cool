const express = require("express");
const marked = require("marked");
const fs = require("fs");
const dotenv = require("dotenv");

dotenv.load();

const app = express();

app.set("views", __dirname);
app.set("view engine", "pug");

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

app.use("*", (req, res) => {
    const dir = __dirname + req.originalUrl;

    res.render("views/directory.pug", {dirs: fs.readdirSync(dir)});
});

module.exports = app;