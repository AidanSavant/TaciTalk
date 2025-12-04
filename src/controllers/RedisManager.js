// Redis Connection

import { createClient } from "redis";

//const redisClient = createClint({
//  url: 'redis://USERNAME:PASSWORD:127.0.0.1:6379'
//})
//const redisClient = createClient({});

redisClient.on("error", (err) => console.log("REDIS Failed ", err));

await redisClient.connect();

console.log("Connected to redis");
await redisClient.FLUSHALL()

async function createMessage(msgJSON){
  let msgID = msgJSON.messageID
  await redisClient.json.set(msgID, "$", msgJSON)
}

async function getMessage(msgID){
  return await redisClient.json.get(msgID, {path: "$"})
}

async function editMessage(msgID,messageType,messageContent){
  let oldMsg = redisClient.json.get(msgID, {path: "$"})
  oldMsg.messageType = messageType;
  oldMsg.messageContent = messageContent;
  await redisClient.json.set(msgID, "$", oldMsg);
}

async function deleteMessage(msgID){
  await redisClient.json.del(msgID, {path: "$"})
}
