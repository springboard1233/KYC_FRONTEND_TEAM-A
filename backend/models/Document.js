import mongoose from "mongoose";

const docSchema = new mongoose.Schema({
  filename: String,
  extractedData: { type: Object, default: {} },
  uploadedAt: { type: Date, default: Date.now },
  userId: { type: String, required: true },
  docType: { type: String },
  status: {
    type: String,
    enum: [
      "pending",
      "approved",
      "rejected",
      "manual_review",
      "Rejected – AML Rule Triggered",
    ],
    default: "pending",
  },
  statusUpdatedAt: Date,
});

export default mongoose.model("Document", docSchema);
