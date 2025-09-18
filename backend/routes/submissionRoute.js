const express = require('express');
const router = express.Router();
const {createSubmission, getMySubmissionStatus, getAllSubmissions, updateSubmissionStatus} = require('../controllers/submissionController');

const { protect, protectAdmin } = require('../middleware/authMiddleware');

// User routes
router.post('/', protect, createSubmission);
router.get('/status', protect, getMySubmissionStatus);

// Admin routes
router.get('/', protectAdmin, getAllSubmissions);
router.patch('/:id', protectAdmin, updateSubmissionStatus);

// GET /api/submissions/my-submissions
// router.get("/my-submissions", verifyUser, async (req, res) => {
//   try {
//     const submissions = await Submission.find({ userId: req.user._id }).sort({ createdAt: -1 });
//     res.json(submissions);
//   } catch (err) {
//     res.status(500).json({ message: "Failed to fetch submissions" });
//   }
// });

module.exports = router;
