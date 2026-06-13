import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const db = mysql
  .createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })
  .promise();

db.getConnection()
  .then((connection) => {
    console.log("MySQL Connected.....");
    connection.release();
  })
  .catch((err) => {
    console.log("Database Connection Failed");
    console.log(err);
  });

export default db;