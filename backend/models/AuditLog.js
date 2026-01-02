import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  user: String,
  action: String,
  status: {
    type: String,
    enum: ["success", "warning", "error", "info"],
    default: "info",
  },
  details: String,
  timestamp: { type: Date, default: Date.now },
  ipAddress: String,
});

export default mongoose.model("AuditLog", auditLogSchema);
