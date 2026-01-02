// routes/admin.js
import express from "express";
import jwt from "jsonwebtoken";
import KYCRequest from "../models/kyc.js";
import Document from "../models/Document.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const SECRET = process.env.JWT_SECRET;

// ---------------------- Auth Middleware ----------------------
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "Missing Authorization" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
}

// ---------------------- Get All KYC Requests ----------------------
router.get("/kyc-requests", authenticate, async (req, res, next) => {
  try {
    const requests = await KYCRequest.find();
    res.json(requests);
  } catch (err) {
    console.error("Error fetching KYC requests:", err);
    next(err);
  }
});

// ---------------------- KYC Action (Approve/Reject/Flag) ----------------------
router.post(
  "/kyc-requests/:id/:action",
  authenticate,
  async (req, res, next) => {
    const { id, action } = req.params;

    if (!["approve", "reject", "flag-review"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    try {
      // 1. Find KYC request
      const reqDoc = await KYCRequest.findById(id);
      if (!reqDoc)
        return res.status(404).json({ message: "KYC Request not found" });

      if (reqDoc.status !== "pending") {
        return res.status(400).json({ message: "Request already processed" });
      }

      // 2. Determine new status
      let newStatus = "";
      if (action === "approve") {
        newStatus = "approved";
      } else if (action === "reject") {
        newStatus = "rejected";
      } else if (action === "flag-review") {
        newStatus = "manual_review";
        reqDoc.manualReviewFlaggedBy =
          req.user?.name || req.user?.email || "admin";
        reqDoc.manualReviewAt = new Date();
      }

      // 3. Update KYC request status
      reqDoc.status = newStatus;
      await reqDoc.save();

      // 4. Update only the documents associated with this KYC request
      if (reqDoc.documents && reqDoc.documents.length > 0) {
        try {
          const docUpdate = await Document.updateMany(
            { filename: { $in: reqDoc.documents }, userId: reqDoc.userId },
            {
              status: newStatus,
              statusUpdatedAt: new Date(),
            }
          );

          console.log(
            `📄 Updated ${docUpdate.modifiedCount} documents for user: ${reqDoc.userId}`
          );
        } catch (docUpdateErr) {
          console.error("❌ Error updating documents status:", docUpdateErr);
        }
      }

      res.json(reqDoc);
    } catch (err) {
      console.error("❌ Error handling KYC action:", err);
      next(err);
    }
  }
);

export default router;
