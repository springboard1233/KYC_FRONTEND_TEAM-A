const asyncHandler = require('express-async-handler');
const Submission = require('../models/submissionModel');
const User = require('../models/userModel');

const createSubmission = asyncHandler(async (req, res) => {
  const { 
    docType,
    fraudScore, 
    riskReasons, 
    extractedText, 
    validationChecks, 
    fraudChecks 
  } = req.body;

  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const user = await User.findById(req.user._id); 

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const existingPending = await Submission.findOne({
    userId: user._id,
    status: 'Pending' 
  });

  if (existingPending) {
    res.status(400);
    throw new Error('You already have a submission pending review.');
  }

  // Create the new submission with all the detailed data
  const submission = await Submission.create({
    userId: user._id,
    userName: user.name,
    docType,
    status: 'Pending',
    fraudScore,
    riskReasons,
    extractedText,
    validationChecks,
    fraudChecks,
  });

  // Notify admin dashboard via WebSocket
  const io = req.app.get('socketio');
  if (io) io.emit('new-submission', submission);

  res.status(201).json(submission);
});

const getAllSubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({}).sort({ createdAt: -1 }) .select("userName fraudScore status riskReasons extractedText validationChecks fraudChecks userId");
  res.status(200).json(submissions);
});

const updateSubmissionStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const updatedSubmission = await Submission.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true }
  );

  if (updatedSubmission) {
    const io = req.app.get('socketio');
    if (io) 
      io.emit('submission-updated', updatedSubmission); 
    res.status(200).json(updatedSubmission);
  } else {
    res.status(404);
    throw new Error('Submission not found');
  }
});

// const getMySubmissionStatus = asyncHandler(async (req, res) => {
//   const submissions = await Submission.find({ userId: req.user._id })
//     .select("_id userName docType status createdAt") 
//     .sort({ createdAt: -1 });

//   res.status(200).json(submissions);
// });

const getMySubmissionStatus = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({ userId: req.user.id })
    .select("_id userName docType status createdAt fraudScore riskReasons")
    .sort({ createdAt: -1 });

  res.status(200).json(submissions);
});


module.exports = {
  createSubmission,
  getMySubmissionStatus,
  getAllSubmissions,
  updateSubmissionStatus
};

