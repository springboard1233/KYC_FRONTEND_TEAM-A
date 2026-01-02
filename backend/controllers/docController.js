import multer from "multer";
import Tesseract from "tesseract.js";
import fs from "fs";
import path from "path";
import Doc from "../models/Document.js";

// -------------------- Multer Config --------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/";
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
export const upload = multer({ storage });

// -------------------- Field Extraction --------------------
// -------------------- Field Extraction --------------------
const extractKYCDetails = (rawText) => {
  let name = "N/A";
  let dob = "N/A";
  let gender = "N/A";
  let aadhaar = "N/A";
  let pan = "N/A";
  let address = "N/A";

  const text = rawText.replace(/\s+/g, " ").trim();
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // --------- Detect Document Type -----------
  const isPanCard =
    /INCOME TAX DEPARTMENT|PERMANENT ACCOUNT NUMBER|INCOME TAX INDIA/i.test(
      text
    );
  const isAadhaar = /AADHAAR|UIDAI/i.test(text);

  if (isPanCard) {
    // -------- PAN Card Extraction --------

    // Extract PAN Number (5 letters + 4 digits + 1 letter)
    const panMatch = text.match(/\b([A-Z]{5}[0-9]{4}[A-Z])\b/);
    if (panMatch) pan = panMatch[1];

    // Extract DOB - commonly mentioned as DOB or Date of Birth on PAN card
    for (let i = 0; i < lines.length; i++) {
      if (/\b(DOB|Date of Birth|D\.O\.B)\b/i.test(lines[i])) {
        if (i + 1 < lines.length) {
          // Usually DOB is in dd/mm/yyyy or dd-mm-yyyy format in next line
          const dobCandidate = lines[i + 1].match(
            /(\d{2}[\/\-]\d{2}[\/\-]\d{4})/
          );
          if (dobCandidate) {
            dob = dobCandidate[1];
            break;
          }
        }
      }
    }

    // Extract Name from PAN card OCR lines (strict uppercase only)
    let rawName = "";
    let panLineIndex = lines.findIndex((line) => pan && line.includes(pan));

    // Strategy 1: Line above PAN number
    if (panLineIndex > 0) {
      rawName = lines[panLineIndex - 1];
    }

    // Strategy 2: Line after keyword "Name"
    for (let i = 0; i < lines.length; i++) {
      if (/Name/i.test(lines[i]) && i + 1 < lines.length) {
        const candidate = lines[i + 1];
        if (candidate.length > rawName.length) rawName = candidate;
      }
    }

    // Final cleanup: keep only uppercase alphabetic words
    if (rawName) {
      const cleanedWords = rawName
        .replace(/[^A-Z\s]/g, "") // Keep only capital letters and spaces
        .split(/\s+/) // Split into words
        .filter((word) => word.length > 1) // Filter out single letters/noise
        .slice(0, 3); // Limit to max 3 words

      name = cleanedWords.join(" ");
    }
  } else if (isAadhaar) {
    // -------- Aadhaar Card Extraction (existing code) --------

    // Aadhaar Number extraction
    const aadhaarMatches = [...text.matchAll(/\b\d{4}\s?\d{4}\s?\d{4}\b/g)];
    const aadhaarNumbers = [];
    for (let match of aadhaarMatches) {
      const start = match.index;
      const context = text
        .substring(Math.max(0, start - 10), start)
        .toLowerCase();
      if (!context.includes("vid")) {
        aadhaarNumbers.push(match[0].replace(/\s+/g, ""));
      }
    }
    if (aadhaarNumbers.length > 0) {
      aadhaar = [...new Set(aadhaarNumbers)][0];
    }

    // Gender extraction
    const genderMatch = text.match(/\b(Male|Female|Transgender)\b/i);
    if (genderMatch) gender = genderMatch[1].toUpperCase();

    // DOB extraction logic (existing)
    for (let i = 0; i < lines.length; i++) {
      if (/\b(Male|Female|Transgender)\b/i.test(lines[i])) {
        if (i > 0) {
          const prevLine = lines[i - 1];
          const dobMatch = prevLine.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})/);
          if (dobMatch) {
            dob = dobMatch[1];
            break;
          }
          const yobMatch = prevLine.match(/([0-9]{4})/);
          if (yobMatch) {
            dob = yobMatch[1];
            break;
          }
        }
      }
    }

    // Name extraction (existing)
    let possibleNames = [];

    for (let i = 0; i < lines.length; i++) {
      if (/^\s*to\b/i.test(lines[i])) {
        if (i + 1 < lines.length) {
          let cleaned = lines[i + 1].replace(/[^A-Za-z\s]/g, "").trim();
          if (cleaned) possibleNames.push(cleaned);
        }
        break;
      }
    }

    for (let i = 0; i < lines.length; i++) {
      if (/(S\/O|D\/O|W\/O|C\/O)/i.test(lines[i])) {
        if (i > 0) {
          let cleaned = lines[i - 1].replace(/[^A-Za-z\s]/g, "").trim();
          if (cleaned) possibleNames.push(cleaned);
        }
        break;
      }
    }

    for (let i = 0; i < lines.length; i++) {
      if (/\b(DOB|Date of Birth|D\.O\.B)\b/i.test(lines[i])) {
        if (i > 0) {
          let cleaned = lines[i - 1].replace(/[^A-Za-z\s]/g, "").trim();
          if (cleaned) possibleNames.push(cleaned);
        }
        break;
      }
    }

    if (possibleNames.length > 0) {
      name = possibleNames.reduce((a, b) => (b.length > a.length ? b : a));
    } else {
      name = "N/A";
    }

    // Address extraction (existing)
    let addressLines = [];
    for (let i = 0; i < lines.length; i++) {
      if (/(S\/O|D\/O|W\/O|C\/O)/i.test(lines[i])) {
        addressLines = lines.slice(i + 1, i + 6);
        break;
      } else if (/dob|date of birth/i.test(lines[i]) && i > 0) {
        addressLines = lines.slice(i + 1, i + 6);
        break;
      }
    }

    if (addressLines.length) {
      let combined = [];
      for (let line of addressLines) {
        combined.push(line);
        if (/\b\d{6}\b/.test(line)) break;
      }

      address = combined
        .join(" ")
        .replace(/\b\d{10}\b/g, "")
        .replace(/\s{2,}/g, " ")
        .trim();
    }
  }

  // Return extracted fields (include pan for pan card)
  return { name, dob, gender, aadhaar, pan, address };
};
export { extractKYCDetails };

// -------------------- Upload and Process Doc --------------------
export const uploadDoc = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    console.log("📄 File uploaded:", req.file.filename);

    // OCR directly on the uploaded file, whether image or PDF (will just fail or get no text for PDFs)
    const result = await Tesseract.recognize(req.file.path, "eng", {
      logger: (info) => console.log(info),
    });

    const rawText = result.data.text;

    console.log("📝 OCR Extracted Text:\n", rawText);

    const extractedData = extractKYCDetails(rawText);
    console.log("✅ Extracted Data:", extractedData);

    const doc = new Doc({
      userId: req.user.id,
      filePath: req.file.path,
      filename: req.file.originalname,
      docType: req.body.docType,
      rawText,
      extractedData,
    });

    await doc.save();
    res.json(extractedData);
  } catch (err) {
    console.error("❌ Error processing document:", err);
    res.status(500).json({ error: "Failed to process document" });
  }
};

// -------------------- Get User Docs --------------------
export const getUserDocs = async (req, res) => {
  try {
    const docs = await Doc.find({ userId: req.user.id });
    res.json(docs);
  } catch (err) {
    console.error("❌ Error fetching user docs:", err);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
};

// DELETE /api/docs/:id
// DELETE /api/docs/:id
export const deleteDoc = async (req, res) => {
  try {
    const docId = req.params.id;

    // Find and delete the document by ID using correct model
    const deleted = await Doc.findByIdAndDelete(docId);

    if (!deleted) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Optionally delete the physical file too
    if (fs.existsSync(deleted.filePath)) {
      fs.unlinkSync(deleted.filePath);
    }

    res.json({ success: true, message: "Document deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting document:", error);
    res.status(500).json({ error: "Server error" });
  }
};
