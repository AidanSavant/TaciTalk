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
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace("T", " ");
    const isoTimestamp = now.toISOString();
    
    const messageId = `${crypto.randomBytes(16).toString("hex")}`;// not for mySQL, the database autoincrements
    const expiresAt = timestamp + 24 * 3600; // 24 hours from now
    const username = await this.db.getUsername(socket.userId);
    
    const message = {
      messageID: messageId,
      timestamp: timestamp,
      isoTimestamp: isoTimestamp,
      messageType: messageType,
      messageContent: messageContent,
      conversationID: conversationID,
      userID: socket.userId,
      expiresAt: expiresAt,
      username: username
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
