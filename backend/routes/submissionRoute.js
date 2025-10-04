const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getMySubmissionStatus, getAllSubmissions, updateSubmissionStatus } = require('../controllers/submissionController');
const { runVerificationPipeline } = require('../controllers/pipelineController');
const { protect, protectAdmin } = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/verify', protect, upload.single('file'), runVerificationPipeline);
router.get('/status', protect, getMySubmissionStatus);

// Admin Routes
router.get('/', protectAdmin, getAllSubmissions);
router.patch('/:id', protectAdmin, updateSubmissionStatus);

module.exports = router;
