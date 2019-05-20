const app = require("./app");
const server = require("http").Server(app);
const io = require("socket.io")(server);

// Served by reverse proxy :P.
server.listen("4202", () => {
    console.log("Listening on port 4202");
});

module.exports = {
    app,
    server,
    io
};