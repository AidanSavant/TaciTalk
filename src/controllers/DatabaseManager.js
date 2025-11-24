const mysql = require("mysql2/promise");

const dbConfig = {
  host: "localhost",
  port: 3306,
  user: "root",
  password: "penguin",
  database: "TaciTalk",
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
