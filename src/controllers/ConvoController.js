class ConvoController {
    constructor(io, db, redis) {
        this.io = io;
        this.db = db;
        this.redis = redis;
    }

    async joinConversation(socket, payload) {
        if(!socket.userId) {
            return socket.emit("error", { message: "Unauthorized User!" });
        }

        const { conversationID } = payload;

        if(!conversationID) {
            return socket.emit("error", { message: "Invalid conversation ID!" });
        }

        socket.join(`conversation_${conversationID}`);
    }

    async conversationCreated(socket, payload) {
        if(!socket.userId) {
            return socket.emit("error", { message: "Unauthorized User!" });
        }

        const { members } = payload;
        members.forEach((memberID) => {
            this.io.to(`user_${memberID}`).emit("added_to_conversation");
        });
    }
}

export default ConvoController;
