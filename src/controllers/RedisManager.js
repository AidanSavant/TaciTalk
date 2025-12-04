// Redis Connection

import { createClient } from "redis";

//const redisClient = createClint({
//  url: 'redis://USERNAME:PASSWORD:127.0.0.1:6379'
//})
const redisClient = createClient({});
const mT = Object.freeze({ // is this even going to be used?
  TEXT: "text",
  GIF: "gif",
  PNG: "png"
  //etc etc
})

redisClient.on("error", (err) => console.log("REDIS Failed ", err));

await redisClient.connect();

console.log("Connected to redis");

await createMessage(2,15,"This is a message from user 2")
await createMessage(3,12,"This is a message from a different chat 3")
await createMessage(3,15,"This should be counted")
await createMessage(3,15,"This should be counted too")
await createMessage(3,15,"This should be counted as well")
await createMessage(3,15,"This should be counted also")
console.log("TEST PRINT ALL "+await redisClient.keys('*'))
console.log("total keys: " + (await getUserMessageCount(3, 15)));
await redisClient.FLUSHALL()

function getMsgID(userID,conversationID){
  return userID.toString() + "-" + conversationID.toString();
}

async function createMessage(userID, conversationID, messageContent){
  let msgID = getMsgID(userID,conversationID);
  let newmsg = await redisClient.rPush(msgID, messageContent);
}

async function deleteMessage(userID,conversationID){
  let msgID = getMsgID(userID,conversationID);
  redisClient.del(msgID);
}

async function getUserLogs(userID,conversationID){
  let msgID = getMsgID(userID,conversationID);
  return await redisClient.lRange(msgID, 0, -1);
}

async function getMessageFromIndex(userID,conversationID,index){
  let msgID = getMsgID(userID,conversationID);
  let message = await redisClient.lIndex(msgID, index);
  return message;
}

async function getUserMessageCount(userID,conversationID){
  let msgID = getMsgID(userID,conversationID);
  //let messages = await redisClient.lLen(msgID);
  let findKey = userID+"-*"
  console.log(findKey)
  //let msgCount = await redisClient.KEYS(userID+"-*").length
  let msgCount = (await redisClient.scan('0', {MATCH: findKey})).length
  return msgCount;
}

async function editMessage(userID,conversationID,index,messageContent){
  let msgID = getMsgID(userID,conversationID);
  await redisClient.lSet(msgID,index,messageContent)
}
