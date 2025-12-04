/*
MessageID
timeSent
MessageType
MessageContent
SavedAt
ConversationID
UserID
*/

const crypto = require("crypto");

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

        const messageId = `${crypto.randomBytes(16).toString("hex")}`;
        const timestamp = new Date().toISOString().slice(0,19).replace('T', ' ');;
        const expiresAt = timestamp + 24 * 3600; // 24 hours from now
    
        const message = {
            messageID: messageId,
            timestamp: timestamp,
            messageType: messageType,
            messageContent: messageContent,
            conversationID: conversationID,
            userID: socket.userId,
            expiresAt: expiresAt
        };

        /*
        await this.redis.setExpiringMessage(
            `message_${messageId}`,
            24 * 3600,
            JSON.stringify(message)
        );
        */

        this.io.to(`conversation_${conversationID}`).emit("new_message", message);
    
        return socket.emit("message_sent", { messageID: messageId });
    }

    async readmessage(socket, payload) {
        if(!socket.userId) {
            return socket.emit("error", { message: "Unauthorized User!" });   
        }

        const { conversationID } = payload;

        if(!messageID) {
            return socket.emit("error", { message: "Invalid message ID!" });
        }

        /*
        const unsavedMessages = await this.redis.getMessages(conversationID);
        const savedMessages = await this.db.getMessages(conversationID);
        
        const allMessages = [...unsavedMessages, ...savedMessages];
        allMessages.sort((a, b) => a.timestamp - b.timestamp);

        return socket.emit("message_history", { messages: allMessages });
        */
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
