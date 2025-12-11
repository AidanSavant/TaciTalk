import RedisManager from "./RedisManager.js";
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
    RedisManager.createMessage(message);
    console.log("MESSAGE CREATED: "+JSON.stringify(await RedisManager.getMessage(messageId)));
    this.io.to(`conversation_${conversationID}`).emit("new_message", message);
    return socket.emit("message_sent", { messageID: messageId });
  }

  async saveMessage(socket, payload){ //converts redis JSON to mySQL
    if (!socket.userId) {
      return socket.emit("error", { message: "Unauthorized User!" });
    }
    const msgJS = await this.redis.getMessage(payload)
    console.log(JSON.stringify(msgJS))
    if (msgJS === null){
      console.log("ERR!: MESSAGE WITH ID: "+payload+" NOT FOUND")
      //await this.redis.flush()
      await this.redis.showALL()
      return
    }
    const msgID = msgJS[0].messageID // probably not neccesary
    const conID = msgJS[0].conversationID
    const usrID = msgJS[0].userID
    const msgTy = msgJS[0].messageType
    const msgCT = msgJS[0].messageContent
    console.log(msgJS[0].conversationID)
    console.log("ATTEMPTING TO SAVE: " + conID + " : " + usrID + " : " + msgTy + " : " + msgCT);
    await this.db.createMessage(conID, usrID, msgTy, msgCT);
    console.log("EVERYTHING HURTS")
    const newMSG = await this.db.getConversationMessages(msgJS[0].conversationID)
    console.log("newID: "+newMSG[newMSG.length-1].MessageID)
    const strarr = [payload,newMSG[newMSG.length-1].MessageID]
    await this.io.to(`conversation_${msgJS[0].conversationID}`).emit("change_id",(strarr))
    await this.redis.deleteMessage(payload)
  }

  async unsaveMessage(socket, payload){ //payload = messageID
    if (!socket.userId) {
      return socket.emit("error", { message: "Unauthorized User!" });
    }
    const msgSQL = await this.db.getMessage(payload)
    console.log("LOADING MESSAGE FROM SQL: ")
    console.log(msgSQL[0])
    const usr = await this.db.getUsername(msgSQL[0].UserID)
    const time = new Date()
    time.setDate(time.getDate() + 1)
    const msg = {
      messageID: `${crypto.randomBytes(16).toString("hex")}`,
      timestamp: msgSQL[0].timeSent,
      messageType: msgSQL[0].MessageType,
      messageContent: msgSQL[0].MessageContent,
      conversationID: msgSQL[0].ConversationID,
      userID: msgSQL[0].UserID,
      expiresAt: time,
      username: usr
    };
    await this.redis.createMessage(msg)
    await this.db.deleteMessage(msgSQL[0].MessageID);
    const strarr = [payload,msg.messageID]
    await this.io.to(`conversation_${msg.conversationID}`).emit("change_id",(strarr))
    console.log("inputting to redis: "+JSON.stringify(msg))

  }
}


export default MessageController;
