const { Server } = require("socket.io");
import { app } from '../../server.js';
const httpServer = createServer(app);


const io = new Server(httpServer, {})

io.on("connection", (socket) => {

})
