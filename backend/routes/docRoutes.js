import express from "express";
import multer from "multer";
import {
  uploadDoc,
  getUserDocs,
  deleteDoc, // ✅ ADD this import
} from "../controllers/docController.js";
import { protect } from "../middelware/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Existing routes
router.post("/upload-doc", protect, upload.single("document"), uploadDoc);
router.get("/get-user-docs", protect, getUserDocs);

// ✅ NEW route to delete a document
router.delete("/:id", protect, deleteDoc);
// In your router file, add:

router.get("/:id/status", protect, async (req, res) => {
  const documentId = req.params.id;

  try {
    // Find the document by ID
    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Optional: Check if the requesting user owns this document (for security)
    if (document.userId !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    // Respond with document status
    res.json({ status: document.status });
  } catch (error) {
    console.error("Error fetching document status:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
