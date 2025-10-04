


const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  docType: { type: String, required: true },
  status: { type: String, required: true, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  
  // New detailed fields
  fraudScore: { type: Number, required: true },
  riskReasons: { type: [String], required: true },
  
  extractedText: { type: mongoose.Schema.Types.Mixed }, 
  
  validationChecks: {
    isTampered: Boolean,
    tamperingConfidence: Number,
    isConsistent: Boolean,
    consistencyConfidence: Number,
  },

  fraudChecks: {
    nameMatchScore: Number,
    isDuplicate: Boolean,
  },

}, { timestamps: true });

const Submission = mongoose.model("Submission", submissionSchema);
module.exports = Submission;