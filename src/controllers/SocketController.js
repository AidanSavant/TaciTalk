const { Server } = require("socket.io");
import { app } from '../../server.js';
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

io.on("message_sent", (message) => { //funciton called when user recieves a message

});

async function sendTo(conversationID, message){
  io.to(conversationID).emit("message_sent", message)
}
