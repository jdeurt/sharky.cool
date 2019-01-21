const app = require("./app");

// Served by reverse proxy :P.
app.listen("8080", () => {
    console.log("Listening on port 8080");
});