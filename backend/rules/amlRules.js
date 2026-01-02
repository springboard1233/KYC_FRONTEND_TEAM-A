// backend/rules/amlRules.js
import fs from "fs";
import path from "path";
import { normalize } from "../utils/normalize.js"; // reuse your normalizer if available

// Try to load a JSON blacklist at backend/rules/blacklistedAddresses.json (optional).
// Format: ["12 Baker Street, London", "Some Address Pattern", ...]
const BLACKLIST_FILE = path.resolve(
  "backend",
  "rules",
  "blacklistedAddresses.json"
);

let blacklistedAddresses = [
  // fallback defaults (example patterns). Replace with real data or a DB call.
  "PO BOX",
  "BLACKLISTED ESTATE",
  "1234 FRAUD LANE",
];

try {
  if (fs.existsSync(BLACKLIST_FILE)) {
    const raw = fs.readFileSync(BLACKLIST_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length) {
      blacklistedAddresses = parsed;
    }
  }
} catch (err) {
  console.warn(
    "Could not load blacklistedAddresses.json — using fallback list."
  );
}

/**
 * Check whether an address is blacklisted.
 * - Performs case-insensitive substring matches against blacklist patterns.
 * - Normalizes input before check.
 */
function isAddressBlacklisted(address) {
  if (!address) return false;
  const norm = normalize(address).toLowerCase();
  return blacklistedAddresses.some((pattern) => {
    if (!pattern) return false;
    return norm.includes(normalize(pattern).toLowerCase());
  });
}

/**
 * Main AML rules runner.
 * @param {Object} opts
 *   - extractedData: object returned from OCR/extraction (should include address, aadhaar etc.)
 *   - isDuplicate: boolean (duplicate aadhaar/pan detected earlier)
 *   - fraudResult: { fraud_score, risk_level } result from fraud scoring
 * @returns {Object} { amlFlags: string[], amlAction: "auto_flag"|"manual_review"|"clear", notes: string[] }
 */
export function applyAmlRules({
  extractedData = {},
  isDuplicate = false,
  fraudResult = {},
} = {}) {
  const amlFlags = [];
  const notes = [];

  // 1) Duplicate Aadhaar -> automatic flag
  if (isDuplicate) {
    amlFlags.push("duplicate_aadhaar");
    notes.push("Aadhaar/PAN matches an existing record (duplicate).");
  }

  // 2) Blacklisted address -> automatic flag
  const addressCandidates = [
    extractedData.address,
    extractedData.present_address,
    extractedData.permanent_address,
    extractedData.residence,
    extractedData.addr, // common alt keys
  ].filter(Boolean);

  const addressString = addressCandidates.join(" ") || "";
  if (isAddressBlacklisted(addressString)) {
    amlFlags.push("blacklisted_address");
    notes.push("Address matches blacklist patterns.");
  }

  // 3) High fraud risk -> flag for manual review
  const riskLevel = (
    fraudResult.risk_level ||
    fraudResult.riskLevel ||
    ""
  ).toString();
  const fraudScore = Number(
    fraudResult.fraud_score ?? fraudResult.fraudScore ?? -1
  );

  if (riskLevel.toLowerCase() === "high" || fraudScore >= 71) {
    amlFlags.push("high_fraud_risk");
    notes.push(`Risk level is High (score: ${fraudScore || "unknown"}).`);
  }

  // Decide action:
  // - If duplicate_aadhaar OR blacklisted_address -> immediate auto_flag (investigate/hold)
  // - Else if high_fraud_risk -> manual_review
  // - Else -> clear
  let amlAction = "clear";
  if (
    amlFlags.includes("duplicate_aadhaar") ||
    amlFlags.includes("blacklisted_address")
  ) {
    amlAction = "auto_flag";
  } else if (amlFlags.includes("high_fraud_risk")) {
    amlAction = "manual_review";
  }

  return {
    amlFlags,
    amlAction,
    notes,
  };
}

export default applyAmlRules;
