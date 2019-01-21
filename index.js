const app = require("./app");

// Served by reverse proxy :P.
app.listen("4202", () => {
    console.log("Listening on port 4202");
});