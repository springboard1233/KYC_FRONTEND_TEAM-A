const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  userId: {type: String, required: true},
  userName: { type: String, required: true },
  docType: { type: String, required: true},
  status: {
    type: String,
    required: true,
    // enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  fraudScore: { type: Number, required: true },
  reasons: [{ type: String, required: true }],
}, { timestamps: true });

module.exports = mongoose.model("Submission", submissionSchema);
