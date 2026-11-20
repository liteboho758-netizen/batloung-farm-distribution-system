
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load local .env file
const currentFile = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFile);

dotenv.config({
  path: path.resolve(currentDirectory, "../../.env")
});

// Database configuration
const databaseUrl = process.env.DATABASE_URL;

const pool = databaseUrl
  ? mysql.createPool(databaseUrl)
  : mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "batloung_farm",

      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      decimalNumbers: true
    });

// Test database connection
export async function testDatabaseConnection() {
  let connection;

  try {
    connection = await pool.getConnection();

    const [rows] = await connection.query(
      "SELECT DATABASE() AS databaseName"
    );

    console.log(
      "MySQL connected successfully. Database:",
      rows[0].databaseName
    );

    return true;

  } catch (error) {
    console.error("MYSQL CONNECTION ERROR:");
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);

    return false;

  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export default pool;
