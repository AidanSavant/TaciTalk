// Redis Connection
import dotenv from "dotenv";

import { createClient } from "redis";

dotenv.config({ path: "../../../.env" });
dotenv.config();

const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    tls: false,
    servername: process.env.REDIS_HOST,
  },
});

redisClient.on("error", (err) => console.log("REDIS Failed ", err));

await redisClient.connect();

console.log("Connected to redis");
await redisClient.FLUSHALL();

async function createMessage(msgJSON) {
  let msgID = msgJSON.messageID;
  await redisClient.json.set(msgID, "$", msgJSON);
}

async function getMessage(msgID) {
  return await redisClient.json.get(msgID, { path: "$" });
}

async function editMessage(msgID, messageType, messageContent) {
  let oldMsg = redisClient.json.get(msgID, { path: "$" });
  oldMsg.messageType = messageType;
  oldMsg.messageContent = messageContent;
  await redisClient.json.set(msgID, "$", oldMsg);
}

async function deleteMessage(msgID) {
  await redisClient.json.del(msgID, { path: "$" });
}

exports = {
  createMessage,
  deleteMessage,
  getMessage,
  editMessage,
};
