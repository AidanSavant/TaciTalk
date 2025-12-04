/*
MessageID
timeSent
MessageType
MessageContent
SavedAt
ConversationID
UserID
*/

class MessageController {
    constructor(io, db, redis) {
        this.io = io;
        this.db = db;
        this.redis = redis;
    }

    async sendMessage(socket, payload) {
        if(!socket.userId) {
            return socket.emit("error", { message: "Unauthorized User!" });   
        }

        const { conversationID, messageType, messageContent } = payload;
    
        if(!conversationID || !messageType || !messageContent) {
            return socket.emit("error", { message: "Invalid message payload!" });
        }
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
}

module.exports = MessageController;
