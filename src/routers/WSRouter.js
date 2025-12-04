const MessageController = require("../controllers/MessageController").default;

class WSRouter {
    constructor(io, db, redis) {
        this.messageController = new MessageController(io, db, redis);
    }

    initRoutes(socket) {
        socket.on("send_message", (payload) => {
            this.messageController.sendMessage(socket, payload);
        })

        socket.on("join_conversation", (payload) => {
            this.messageController.joinConversation(socket, payload);
        });

        /*
        This would be if the user wanted to leave, this would remove their socketId from the conversation room
        socket.on("leave_conversation", (payload) => {
            this.messageController.leaveConversation(socket, payload);
        });

        socket.on("read_message", (payload) => {
            this.messageController.readMessage(socket, payload);
        });
        */
    }
}

module.exports = WSRouter;
