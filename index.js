const server = require("./app").server;

// Served by reverse proxy :P.
server.listen("4202");
console.log("Listening on port 4202");