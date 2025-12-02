const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const DatabaseManager = require("src/controllers/DatabaseManager");

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static("public"));

app.get("/api/conversations/:userID", async (req, res) => {
  try {
    const userID = req.params.userID;
    const conversations = await DatabaseManager.getConversations(userID);
    res.json(conversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

io.on("connection", () => {
  console.log("Connected!");
});

server.listen(5050, () => {
  console.log("Listening on: http://localhost:5050");
});
