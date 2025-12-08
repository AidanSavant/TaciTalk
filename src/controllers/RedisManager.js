import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config({ path: "../../../.env" });

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

  async connect() {
    await this.client.connect();
    console.log("Connected to Redis");
  }

  async createMessage(msgJSON) {
    await this.client.json.set(msgJSON.messageID, "$", msgJSON);
  }

  async getMessage(messageID) {
    return this.client.json.get(messageID, { path: "$" });
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
