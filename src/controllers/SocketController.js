//const { Server } = require("socket.io");
import { Server } from 'socket.io'
import { createServer } from 'http'
import pkg from '../../server.js'
const app = pkg.app;
//import { app } from '../.././server.js';
const httpServer = createServer(app);


const io = new Server(httpServer, {})

io.on("connection", (socket) => { //function called when user connects to the server
  if (socket.recovered){
    console.log("Data recovered Succesfuly")
    //conversations resolved, no data lost
  } else{
    console.log("Data lost!")
    //unrecovered sockets will lose connection to their conversations
  }
});

httpServer.listen(3000); //port might need to be changed to 5050

io.engine.on("connection_error", (err) =>{
  console.log("ERROR: "+err.code+";\n"+err.message+";\n"+err.context)
})

io.on("message_sent", (userID, messageID, messageType, messageContent) => { //funciton called when user recieves a message

});

sendTo();

async function sendTo(conversationID, messageID){
  let timeSent = new Date().toISOString().slice(0,19).replace('T', ' ');
  // timesent formatted at [YYYY/MM/DD HH:MM:SS] (UTC TIME)
  io.to(conversationID).emit("message_sent", userID, messageID, messageType, messageContent)
}

/*
MessageID
timeSent
MessageType
MessageContent
SavedAt
ConversationID
UserID
*/
