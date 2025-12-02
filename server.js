require("dotenv").config();

const cors = require("cors")
const express = require("express")
const jwt = require("jsonwebtoken")
const path = require("path")
const AuthRouter = require("./src/routers/AuthRouter.js")

const app = express();
app.use(cors())
app.use(express.json())
app.use("/api", AuthRouter)

function parseCookies(cookies) {
  const parsedCookies = {};
  if(!cookies) return {};

  cookies.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    const key = parts.shift().trim();
    const value = decodeURIComponent(parts.join('='));

    parsedCookies[key] = value;
  });
  
  return parsedCookies;
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  let token;
  if(authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  else if(req.headers.cookie) {
    const cookies = parseCookies(req.headers.cookie);
    token = cookies.token;
  }

  if(!token) {
    return res.status(401).sendFile(path.join(__dirname, 'public', 'pages', 'unauthorized.html'));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
  
    return next();
  } 
  catch(err) {
    return res.status(401)
              .sendFile(path.join(__dirname, 'public', 'pages', 'unauthorized.html'));
  }
}


app.get('/pages/dashboard.html', authMiddleware, (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pages', 'dashboard.html'));
});

app.use(express.static("public"))

app.listen(5050, () => {
  console.log("Server is running: localhost:5050");
})
