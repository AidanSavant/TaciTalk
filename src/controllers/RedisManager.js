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

console.log("Connected to redis")
createMessage(2,148, "I'll give it to someone special")
console.log("TEST FINAL")
//let getNewMsg = await redisClient.get("2:148")
//console.log(getNewMsg.toString())



async function createMessage(ConversationID, userID, messageContent){
  let msgID = ConversationID.toString()+"-"+userID.toString()
  let newmsg = await redisClient.rPush(msgID,messageContent)
  console.log("GFIDSAFO")
  for (let i = 0; i < parseInt(newmsg.toString()); i++){
    console.log(newmsg[i])
  }
  let reteP = await redisClient.lRange(msgID, 0, -1);
  console.log(reteP)
  console.log(newmsg.length)
  console.log("FINISHED")
}

async function deleteMessage(messageID){

}
