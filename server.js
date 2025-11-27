require("dotenv").config();

const cors = require("cors")
const express = require("express")
const AuthRouter = require("./src/routers/AuthRouter.js")

const app = express();
app.use(cors())
app.use("/api", AuthRouter)
app.use(express.static("public"))

app.listen(5050, () => {
  const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DATABASE || "TaciTalk",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool;
try {
  pool = mysql.createPool(dbConfig);
  console.log("MySQL connection pool initialized successfully.");
} catch (error) {
  console.error("Failed to initialize MySQL pool:", error);
  process.exit(1);
}
})
