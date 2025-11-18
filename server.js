const express = require("express")
const { createServer } = require("http")
const { Server } = require("socket.io")

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static("public"))

io.on("connection", () => {
  console.log("Connected!")
})

server.listen(5050, () => {
  console.log("Listening on: http://localhost:5050");
})

