// server.js (or index.js in your backend directory)

import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import docRoutes from "./routes/docRoutes.js";
import verificationRoutes from "./routes/verification.js";
import kycRoutes from "./routes/kyc.js"; // KYC routes
import adminRoutes from "./routes/adminRoutes.js";
import docsRouter from "./routes/docRoutes.js";
import FraudAlertRoutes from "./routes/FraudAlertRoutes.js"; // Fraud alert routes
import auditLogRoutes from "./routes/auditLogs.js";

// Load environment variables
dotenv.config();
console.log("JWT_SECRET loaded:", process.env.JWT_SECRET);

// Connect to MongoDB
connectDB();

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/docs", docRoutes);
app.use("/api/verification", verificationRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/docs", docsRouter);
app.use("/api/alerts", FraudAlertRoutes); // Use fraud alert routes
app.use("/api/audit-logs", auditLogRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));
