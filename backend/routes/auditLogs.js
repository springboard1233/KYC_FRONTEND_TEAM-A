import express from "express";
import AuditLog from "../models/AuditLog.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100); // adjust limit if needed
    res.json(logs);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
