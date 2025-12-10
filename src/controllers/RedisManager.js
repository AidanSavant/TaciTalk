import dotenv from "dotenv";
dotenv.config();

import { createClient } from "redis";

class RedisManager {
  constructor() {
      this.client = createClient({
        url: process.env.REDIS_URL,
        socket: {
          tls: false,
          servername: process.env.REDIS_HOST,
        },
      });

      this.client.on("error", (err) => {
        console.error("Redis Error:", err);
      });
  }

  async flush(){ //DEBUG!!!
    await this.client.flushAll('SYNC');
  }
  async showALL(){ //DEBUG!!!
    const keys = await this.client.keys('*');
    for (var i = 0; i < keys.length; i++){
      console.log(JSON.stringify(await this.getMessage(keys[i])))
    }
  }

  async connect() {
    await this.client.connect();
    console.log("Connected to Redis");
  }

  async createMessage(msgJSON) {
    await this.client.json.set(msgJSON.messageID, "$", msgJSON);
    await this.client.expire(msgJSON.messageID, 86400) // number of seconds in a day
  }

  async getMessage(messageID) {
    return this.client.json.get(messageID, { path: "$" });
  }

  async returnFromConvo(conversationID){ //nonperformant
    //compares all messages with a given conversationID
    //If message contains said ID, will append to a json array
    const msgs = await this.client.keys('*')
    let msgFromConv = []
    msgs.forEach(async (msg)=>{
      //const convID = await this.client.json.get(msg, { path: `$.conversationID[?@==${conversationID}` });
      const convID = await this.client.json.get(msg, { path: '$' });
      if (convID.conversationID == conversationID){
        msgFromConv.push(convID)
      }
    })
    //returns array of matched messages, can return an empty array
    return msgFromConv
  }

  async editMessage(messageID, messageType, messageContent) {
    const oldMsg = await this.getMessage(messageID);
    oldMsg.messageType = messageType;
    oldMsg.messageContent = messageContent;

    return this.client.json.set(messageID, "$", oldMsg);
  }

  async deleteMessage(messageID) {
    await this.client.json.del(messageID);
  }
}

export default new RedisManager();
