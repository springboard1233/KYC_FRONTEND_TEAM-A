import express from "express";
import { protect } from "../middelware/authMiddleware.js";
import KYCRequest from "../models/kyc.js";
import Document from "../models/Document.js"; // <-- import Document model
import crypto from "crypto";
import { normalize } from "../utils/normalize.js";

const hashValue = (value) => {
  return crypto.createHash("sha256").update(value).digest("hex");
};

const router = express.Router();

router.post("/submit", protect, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res
        .status(400)
        .json({ error: "User ID missing in token payload" });
    }

    const extractedData = req.body.extractedData || {};

    // Normalize and hash Aadhaar & PAN
    const rawAadhaar =
      typeof extractedData.aadhaar === "string"
        ? extractedData.aadhaar
        : extractedData.aadhaar?.aadhaar || "";

    const rawPan =
      typeof extractedData.pan === "string"
        ? extractedData.pan
        : extractedData.pan?.pan || "";

    const aadhaar = normalize(rawAadhaar);
    const pan = normalize(rawPan);

    const aadhaarHash = aadhaar ? hashValue(aadhaar) : null;
    const panHash = pan ? hashValue(pan) : null;

    // 🔍 Check for duplicates
    const duplicate = await KYCRequest.findOne({
      $or: [
        aadhaarHash ? { aadhaarHash } : null,
        panHash ? { panHash } : null,
      ].filter(Boolean),
    });

    const isDuplicate = !!duplicate;
    extractedData.is_duplicate = isDuplicate;

    // ✅ Build fraudInfo (from frontend or fallback)
    let fraudInfo = req.body.fraudInfo || [];

    // ✅ Add AML auto-flag rule if duplicate found
    if (isDuplicate) {
      fraudInfo.push({
        type: "aml",
        fraudScore: 100,
        riskLevel: "high",
        amlFlags: [
          aadhaarHash ? "duplicate_aadhaar" : null,
          panHash ? "duplicate_pan" : null,
        ].filter(Boolean),
        amlAction: "auto_flag",
        reasons: ["Duplicate Aadhaar or PAN found in existing KYC"],
      });
    }

    // Set KYC status based on AML or fraud rules
    let status = "pending";
    let rejectionReason = "";

    if (isDuplicate) {
      status = "Rejected – AML Rule Triggered";
      rejectionReason = "AML Auto Flag triggered: Duplicate Aadhaar or PAN";

      try {
        const { aadhaar, pan } = req.body.extractedData || {};

        // Build a query for duplicates
        const duplicateQuery = {
          userId,
          $or: [],
        };
        if (aadhaar)
          duplicateQuery.$or.push({ "extractedData.aadhaar": aadhaar });
        if (pan) duplicateQuery.$or.push({ "extractedData.pan": pan });
        // Also optionally match by filename if needed:
        if (req.body.filenames && req.body.filenames.length > 0) {
          duplicateQuery.$or.push({ filename: { $in: req.body.filenames } });
        }

        console.log("Duplicate query:", duplicateQuery);

        const duplicateDocs = await Document.find(duplicateQuery).sort({
          createdAt: 1,
        });

        console.log("Found duplicateDocs:", duplicateDocs);

        if (duplicateDocs.length > 1) {
          // reject last two
          const docsToReject = duplicateDocs.slice(-2);
          const idsToReject = docsToReject.map((d) => d._id);

          const updateResult = await Document.updateMany(
            { _id: { $in: idsToReject } },
            {
              $set: {
                status,
                rejectionReason,
                statusUpdatedAt: new Date(),
              },
            }
          );
          console.log("Last two duplicate docs updated:", updateResult);
        } else {
          console.log(
            "ℹ️ Only one document found — not rejecting anything.",
            duplicateDocs.length
          );
        }
      } catch (err) {
        console.error("Error updating duplicate documents:", err);
      }
    }

    const kycData = {
      ...req.body,
      userId,
      extractedData,
      fraudInfo,
      aadhaarHash,
      panHash,
      status,
      rejectionReason,
      documents: req.body.filenames || [], // store filenames array
    };

    const newKYC = new KYCRequest(kycData);
    await newKYC.save();

    return res.status(201).json({
      message: "✅ KYC submitted successfully",
      isDuplicate,
      kyc: newKYC,
    });
  } catch (err) {
    console.error("❌ Error saving KYC:", err);
    return res.status(500).json({
      error: err.message || "Failed to save KYC",
      stack: err.stack,
    });
  }
});

export default router;
