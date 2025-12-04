// Redis Connection
const { createClient } = require("redis");

let redisClient;
const mT = Object.freeze({
  TEXT: "text",
  GIF: "gif",
  PNG: "png"
});

// Initialize Redis client asynchronously
/*
(async () => {
  try {
    redisClient = createClient({});

    redisClient.on("error", (err) => console.log("REDIS Failed ", err));

    await redisClient.connect();
    console.log("Connected to redis");
  } catch (error) {
    console.error("Failed to initialize Redis:", error);
  }
})();
*/

function getMsgID(userID, conversationID) {
  return conversationID.toString() + "-" + userID.toString();
}

async function createMessage(userID, conversationID, messageContent) {
  if (!redisClient) throw new Error("Redis client not initialized");
  let msgID = getMsgID(userID, conversationID);
  let newmsg = await redisClient.rPush(msgID, messageContent);
  return newmsg;
}

async function deleteMessage(userID, conversationID) {
  if (!redisClient) throw new Error("Redis client not initialized");
  let msgID = getMsgID(userID, conversationID);
  await redisClient.del(msgID);
}

async function getUserLogs(userID, conversationID) {
  if (!redisClient) throw new Error("Redis client not initialized");
  let msgID = getMsgID(userID, conversationID);
  return await redisClient.lRange(msgID, 0, -1);
}

async function getMessageFromIndex(userID, conversationID, index) {
  if (!redisClient) throw new Error("Redis client not initialized");
  let msgID = getMsgID(userID, conversationID);
  let message = await redisClient.lIndex(msgID, index);
  return message;
}

async function getUserMessageCount(userID, conversationID) {
  if (!redisClient) throw new Error("Redis client not initialized");
  let msgID = getMsgID(userID, conversationID);
  let messages = await redisClient.lLen(msgID);
  return messages;
}

async function editMessage(userID, conversationID, index, messageContent) {
  if (!redisClient) throw new Error("Redis client not initialized");
  let msgID = getMsgID(userID, conversationID);
  await redisClient.lSet(msgID, index, messageContent);
}

module.exports = {
  createMessage,
  deleteMessage,
  getUserLogs,
  getMessageFromIndex,
  getUserMessageCount,
  editMessage,
  getMsgID,
  mT
};
