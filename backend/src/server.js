
import express from "express";
import cors from "cors";
import pool, { testDatabaseConnection } from "./config/db.js";

import supplierRoutes from "./routes/supplierRoutes.js";
import fruitRoutes from "./routes/fruitRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

import errorHandler from "./middleware/errorHandler.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API health check
app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT DATABASE() AS databaseName");

    res.status(200).json({
      status: "OK",
      message: "Batloung Farm API is working.",
      database: "connected",
      databaseName: rows[0].databaseName
    });

  } catch (error) {
    console.error("Health check database error:");
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);

    res.status(503).json({
      status: "ERROR",
      database: "disconnected",
      message: "Database connection unavailable.",
      detail: process.env.NODE_ENV === "development"
        ? error.message
        : undefined,
      code: process.env.NODE_ENV === "development"
        ? error.code
        : undefined
    });
  }
});

// API routes
app.use("/api/suppliers", supplierRoutes);
app.use("/api/fruits", fruitRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api", transactionRoutes);
app.use("/api/reports", reportRoutes);

// Unknown endpoint
app.use((req, res) => {
  res.status(404).json({
    status: "ERROR",
    message: "API endpoint not found."
  });
});

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  const databaseConnected = await testDatabaseConnection();

  if (!databaseConnected) {
    console.log("WARNING: Server started without a database connection.");
  }

  app.listen(PORT, () => {
    console.log(`Batloung Farm API running at http://localhost:${PORT}`);
  });
}

startServer();

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  await pool.end();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down server...");
  await pool.end();
  process.exit(0);
});
