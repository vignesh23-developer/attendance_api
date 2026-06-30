import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

db.getConnection((err, connection) => {
  if (err) {
    console.log("Database Connection Failed");
    console.log(err);
    return;
  }

  console.log("MySQL Connected.....");

  connection.query("SET time_zone = '+05:30'", (err) => {
    if (err) {
      console.log("Timezone Error:", err);
    } else {
      console.log("Timezone set to Asia/Kolkata");
    }

    connection.release();
  });
});

export default db;