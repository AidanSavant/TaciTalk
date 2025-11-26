require("dotenv").config();

const cors = require("cors")
const express = require("express")
const AuthRouter = require("./src/routers/AuthRouter.js")

const app = express();
app.use(cors())
app.use("/api", AuthRouter)
app.use(express.static("public"))

app.listen(5050, () => {
  console.log("Listening on: http://localhost:5050");
})
