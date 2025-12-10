import ConvoController from "../controllers/ConvoController.js";
import MessageController from "../controllers/MessageController.js";

class WSRouter {
    constructor(io, db, redis) {
        this.convoController = new ConvoController(io, db, redis);
        this.messageController = new MessageController(io, db, redis);
    }

    initRoutes(socket) {
        if(socket.userId) {
            socket.join(`user_${socket.userId}`);
            console.log(`User ${socket.userId} joined room user_${socket.userId}`);
        }

        socket.on("send_message", (payload) => {
            this.messageController.sendMessage(socket, payload);
        })

        socket.on("join_conversation", (payload) => {
            this.convoController.joinConversation(socket, payload);
        });

        socket.on("conversation_created", (payload) => {
            this.convoController.conversationCreated(socket, payload);
        });
    }
}

export default WSRouter;
