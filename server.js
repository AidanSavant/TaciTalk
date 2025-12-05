require("dotenv").config();

const cors = require("cors");
const path = require("path");
const express = require("express");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const { createServer } = require("http");

const AuthRouter = require("./src/routers/AuthRouter.js");
const ConvRouter = require("./src/routers/DashRouter.js");

const db = require("./src/controllers/DatabaseManager.js");
const redis = require("./src/controllers/RedisManager.js");
const WSRouter = require("./src/routers/WSRouter.js");

function parseCookies(cookies) {
  const parsedCookies = {};
  if (!cookies) return {};

  cookies.split(";").forEach((cookie) => {
    const parts = cookie.split("=");
    const key = parts.shift().trim();
    const value = decodeURIComponent(parts.join("="));

    parsedCookies[key] = value;
  });

  return parsedCookies;
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  let token;
  if(authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } 
  else if(req.headers.cookie) {
    const cookies = parseCookies(req.headers.cookie);
    token = cookies.token;
  }

  if(!token) {
    return res
      .status(401)
      .sendFile(path.join(__dirname, "public", "pages", "unauthorized.html"));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;

    return next();
  } 
  catch(err) {
    return res.status(401).sendFile(path.join(__dirname, 'public', 'pages', 'unauthorized.html'));
  }
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());
app.use("/api", AuthRouter);
app.use("/api", ConvRouter);

app.get("/pages/dashboard.html", authMiddleware, (_, res) => {
  res.sendFile(path.join(__dirname, "public", "pages", "dashboard.html"));
});

app.use(express.static("public"));
app.set("io", io)

const wsRouter = new WSRouter(io, db, redis);

io.on("connection", (socket) => {
  console.log("New client connected: ", socket.id);

  const cookies = parseCookies(socket.handshake.headers.cookie);
  const token = cookies.token;

  if(!token) {
    console.log("Unauthorized socket connection attempt: ", socket.id);
    return socket.disconnect(true);
  }
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = payload.userId;
    wsRouter.initRoutes(socket);
  }
  catch(err) {
    console.log("Unauthorized socket connection attempt: ", socket.id);
    return socket.disconnect(true);
  }
  
  socket.on("disconnect", () => {
    console.log("Client disconnected: ", socket.id);
  });
})

httpServer.listen(5050, () => {
  console.log("Server is running: localhost:5050");
})
