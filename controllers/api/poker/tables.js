const io = require("../../../app").io;
const shortid = require("shortid");
const uuid = require("uuid/v4");

const namespace = io.of("/api/poker");

/*

EVENTS:

server-emitted
- player
    - create
- game
    - bet
    - take
- invalid

client-emitted
- player
    - bet
    - take
- game
    - join

*/

namespace.on("connection", socket => {
    socket.on("game.join", data => {
        if (!data || !data.playerName) {
            socket.emit("invalid", "Invalid 'game.join' event data.");

            return;
        }

        let player = {
            ready: false,
            id: data.playerID || uuid(),
            roomID: "",
            name: "",
            chips: {
                currentBet: 0,
                inventory: 1000
            }
        };

        player.roomID = data.roomID || shortid.generate();
        player.name = data.playerName;
        player.ready = true;

        socket.join(player.roomID);

        namespace.to(player.roomID).emit("player.create", player);

        socket.emit("player.confirm", player.id);
    });

    socket.on("player.bet", data => {
        if (!data.room || !data.player || !data.player.roomID || !data.player.chips.inventory || !Number(data.amount)) {
            socket.emit("invalid", "Invalid 'player.bet' event data.");

            return;
        }

        if (data.amount > data.player.chips.inventory) {
            socket.emit("invalid", "Bet amount too large.");

            return;
        }

        namespace.to(data.player.roomID).emit("game.bet", data);
    });

    socket.on("player.take", data => {
        if (!data.room || !data.player || !data.player.roomID || !data.room.chipPool || !Number(data.amount)) {
            socket.emit("invalid", "Invalid 'player.take' event data.");

            return;
        }

        if (data.amount > data.room.chipPool) {
            socket.emit("invalid", "Take amount too large.");

            return;
        }

        namespace.to(data.player.roomID).emit("game.take", data);
    });

    socket.on("player.leave", data => {
        if (!data.playerID || !data.roomID) {
            socket.emit("invalid", "Invalid 'player.leave' event data.");

            return;
        }

        namespace.to(data.roomID).emit("player.leave", data.playerID);
    });

    socket.on("game.roundend", room => {
        namespace.to(room.id).emit("game.roundend", room);
    });

    socket.on("game.update", room => {
        namespace.to(room.id).emit("game.update", room);
    });
});