const asyncHandler = require('express-async-handler');
const axios = require('axios');
const FormData = require('form-data');
const Submission = require('../models/submissionModel');

const PYTHON_API_URL = "http://localhost:5001";

const runVerificationPipeline = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400); throw new Error('Document file is required.');
    }

    const { docType } = req.body;

    // validate document and extract text
    const form = new FormData();
    form.append('file', req.file.buffer, req.file.originalname);
    form.append('userEnteredName', req.user.name);
    
    const validationResponse = await axios.post(`${PYTHON_API_URL}/validate_document`,form, {
        headers: form.getHeaders(),
    });

    const validationData = validationResponse.data;
    if (validationData.status !== 'success') {
        res.status(500); throw new Error('Failed to validate document.');
    }

    const extractedText = validationData.extracted_text;
    const docNumber = extractedText.AadhaarNumber || extractedText.PANNumber || '';
    const nameOnDoc = extractedText.Name || '';

    // run fraud checks
    const fraudForm = new FormData();
    fraudForm.append('name_on_doc', nameOnDoc);
    fraudForm.append('user_name', req.user.name);
    fraudForm.append('doc_number', docNumber);

    const fraudResponse = await axios.post(`${PYTHON_API_URL}/check_fraud`, fraudForm, {
        headers: fraudForm.getHeaders(),
    });

    const fraudData = fraudResponse.data.fraud_analysis;

    // Save complete submission to MongoDB
    const submission = await Submission.create({
        userId: req.user.id,
        userName: req.user.name,
        docType: docType, 
        status: 'Pending',
        fraudScore: fraudData.final_fraud_score,
        riskReasons: fraudData.risk_reasons,
        extractedText: extractedText,
        validationChecks: {
            isTampered: validationData.validation.cnn_tampering_check.is_tampered,
            tamperingConfidence: validationData.validation.cnn_tampering_check.confidence,
            isConsistent: validationData.validation.nlp_consistency_check.is_consistent,
            consistencyConfidence: validationData.validation.nlp_consistency_check.confidence,
        },
        fraudChecks: {
            nameMatchScore: fraudData.name_match_score,
            isDuplicate: fraudData.is_duplicate_document,
        },
    });
    
    const io = req.app.get('socketio');
    io.emit('new-submission', submission); 

    res.status(201).json({ message: "Submission successful and is pending for review.", submission });
});

module.exports = { runVerificationPipeline };