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

app.use(express.static(__dirname));

// Controllers
app.post("/api/gitpushed", controllers.api.git.pushed);

// Make sure to handle directories.pug
app.get("/views/directory.pug", (req, res) => {
    res.redirect("/");
});

app.get("*", (req, res) => {
    const dir = __dirname + req.originalUrl;

    res.render("views/directory.pug", {
        // I'm never going to put dots in dirs so this is fine (and faster).
        dirs: fs.readdirSync(dir).filter(dir => !dir.startsWith(".")).map(dir => !dir.includes(".") && dir != "LICENSE" ? dir + "/" : dir),
        path: req.originalUrl
    });
});

module.exports = app;