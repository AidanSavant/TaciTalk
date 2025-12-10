import crypto from "crypto";

class MessageController {
  constructor(io, db, redis) {
    this.io = io;
    this.db = db;
    this.redis = redis;
  }

  async sendMessage(socket, payload) {
    if (!socket.userId) {
      return socket.emit("error", { message: "Unauthorized User!" });
    }

    const { conversationID, messageType, messageContent } = payload;

    if (!conversationID || !messageType || !messageContent) {
      return socket.emit("error", { message: "Invalid message payload!" });
    }

    const messageId = `${crypto.randomBytes(16).toString("hex")}`;
    const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
    const expiresAt = timestamp + 24 * 3600; // 24 hours from now

    const message = {
      messageID: messageId,
      timestamp: timestamp,
      messageType: messageType,
      messageContent: messageContent,
      conversationID: conversationID,
      userID: socket.userId,
      expiresAt: expiresAt,
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
}

export default MessageController;
