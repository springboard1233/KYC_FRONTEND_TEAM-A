import mongoose from "mongoose";

const fraudAlertSchema = new mongoose.Schema({
  caseId: { type: String, required: true },
  riskLevel: { type: String, enum: ["High", "Medium", "Low"], required: true },
  reason: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  documentType: { type: String, required: true },
  amlFlags: [String],
  amlAction: String,
  confidence: { type: Number, min: 0, max: 100, required: true },
});

export default mongoose.model("FraudAlert", fraudAlertSchema);
