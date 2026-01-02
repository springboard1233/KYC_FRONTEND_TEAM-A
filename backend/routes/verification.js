// ... top-of-file imports (existing)
import express from "express";
import multer from "multer";
import Tesseract from "tesseract.js";
import stringSimilarity from "string-similarity";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import { execFile } from "child_process";
import path from "path";
import { extractKYCDetails } from "../controllers/docController.js";
import KYCRequest from "../models/kyc.js";
import crypto from "crypto";
import { normalize } from "../utils/normalize.js";
import FraudAlert from "../models/FraudAlert.js";
import AuditLog from "../models/AuditLog.js";

// NEW: AML rules module
import applyAmlRules from "../rules/amlRules.js";

const hashValue = (value) =>
  crypto.createHash("sha256").update(value).digest("hex");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/verify-doc", upload.single("documentImage"), async (req, res) => {
  try {
    const { documentType, userName } = req.body;
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({ error: "Document image is required" });
    }
    if (!documentType) {
      return res
        .status(400)
        .json({ error: "Missing required field: documentType" });
    }

    // Step 1: OCR
    const {
      data: { text: rawText },
    } = await Tesseract.recognize(imageFile.path, "eng", {
      logger: (m) => console.log(m),
    });

    // Step 2: Extract data
    const extractedData = extractKYCDetails(rawText);
    const aadhaarNumber = extractedData?.aadhaar || "";
    const nameOnDoc = extractedData?.name || "";

    // Step 3: Duplicate check
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

    const orQuery = [
      aadhaarHash ? { aadhaarHash } : null,
      panHash ? { panHash } : null,
    ].filter(Boolean);
    const duplicate = await KYCRequest.findOne({ $or: orQuery });
    const isDuplicate = !!duplicate;

    extractedData.is_duplicate = isDuplicate;

    // Step 4: Name similarity
    let nameSimilarityScore = 1.0;
    let reason = [];

    if (userName && nameOnDoc) {
      nameSimilarityScore = stringSimilarity.compareTwoStrings(
        userName.toLowerCase(),
        nameOnDoc.toLowerCase()
      );
    } else {
      reason.push("Missing name for comparison");
    }

    // Step 5: Run fraud scoring
    const fraudInput = {
      is_duplicate: isDuplicate,
      aadhaar_number: aadhaarNumber,
      pan_number: extractedData?.pan || "",
      name_similarity_score: nameSimilarityScore,
      name_on_doc: nameOnDoc,
      name_input: userName || "",
      type: documentType,
    };

    const fraudInputBase64 = Buffer.from(JSON.stringify(fraudInput)).toString(
      "base64"
    );

    const pythonPath =
      "C:\\Users\\sdgeryuj\\AppData\\Local\\Programs\\Python\\Python313\\python.exe";
    const scriptPath = path.resolve("scripts/fraudScoring.py");
    const pythonArgs = [scriptPath, fraudInputBase64, imageFile.path];

    execFile(pythonPath, pythonArgs, (error, stdout, stderr) => {
      (async () => {
        fs.unlink(imageFile.path, (err) => {
          if (err) console.error("Failed to delete uploaded file:", err);
        });

        if (error) {
          console.error("Python script error:", stderr);
          return res.status(500).json({ error: "Fraud scoring failed" });
        }

        try {
          const fraudResult = JSON.parse(stdout);
          const finalRiskLevel = fraudResult.risk_level;
          const fraudScore = fraudResult.fraud_score;
          const fraudReasons = fraudResult.reasons;

          const valid = fraudScore <= 70;
          const status = valid ? "Valid Document" : "Invalid Document";
          const fraudReasonList = [...reason, ...fraudReasons];

          // ----- NEW: Apply AML rules here, BEFORE final response -----
          const amlResult = applyAmlRules({
            extractedData,
            isDuplicate,
            fraudResult: {
              fraud_score: fraudScore,
              risk_level: finalRiskLevel,
            },
          });

          const amlFlags = amlResult.amlFlags || [];
          const amlAction = amlResult.amlAction || "clear";
          const amlNotes = amlResult.notes || [];

          // ✅ Create FraudAlert if needed (either model risk OR AML flags require action)
          // We now escalate if:
          //  - model risk is not Low OR
          //  - amlAction is auto_flag or manual_review
          const shouldCreateAlert =
            finalRiskLevel !== "Low" ||
            amlAction === "auto_flag" ||
            amlAction === "manual_review";

          if (shouldCreateAlert) {
            try {
              await FraudAlert.create({
                caseId: `FR-${Date.now()}`,
                riskLevel: finalRiskLevel,
                reason: [...fraudReasonList, ...amlFlags, ...amlNotes].join(
                  ", "
                ),
                documentType,
                userId: req.user?.id || "anonymous", // Fallback
                confidence: Math.round(100 - fraudScore),
                amlFlags, // record AML flags
                amlAction,
              });
            } catch (alertError) {
              console.error("Failed to create FraudAlert:", alertError);
            }
          }

          // ✅ Create Audit Log
          try {
            const isAmlFlagged = amlAction === "auto_flag"; // adjust based on how you define this
            const amlReasons = amlFlags?.length
              ? `AML Auto Flag triggered: ${amlFlags.join(", ")}`
              : "No AML flags";

            await AuditLog.create({
              user: req.user?.name || "System",
              action: "Fraud Verification",
              status: isAmlFlagged
                ? "error"
                : finalRiskLevel === "High"
                ? "warning"
                : valid
                ? "success"
                : "error",
              details: `Fraud Score: ${fraudScore}% | Risk: ${finalRiskLevel} | ${amlReasons}`,
              ipAddress: req.ip || "Internal",
            });
          } catch (auditErr) {
            console.error("Audit log failed:", auditErr);
          }

          // ✅ Final Response includes AML flags & action
          return res.json({
            id: uuidv4(),
            timestamp: new Date(),
            valid,
            status,
            fraudScore,
            riskLevel: finalRiskLevel,
            reason: fraudReasonList,
            extractedData,
            ocrTextSnippet: rawText.slice(0, 200),
            isDuplicate,
            aml_flags: amlFlags,
            aml_action: amlAction,
            aml_notes: amlNotes,
          });
        } catch (parseError) {
          console.error("Error parsing Python output:", parseError);
          return res.status(500).json({ error: "Invalid Python output" });
        }
      })();
    });
  } catch (error) {
    console.error("Error processing document:", error);
    return res.status(500).json({ error: "Failed to process document" });
  }
});

export default router;
