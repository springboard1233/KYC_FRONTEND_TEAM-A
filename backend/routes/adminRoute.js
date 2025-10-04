const express = require('express');
const { registerAdmin, loginAdmin} = require('../controllers/adminController');
const {protectAdmin} = require('../middleware/authMiddleware');
const router = express.Router();

router.post("/register", protectAdmin,registerAdmin);
router.post("/login", loginAdmin);
// router.get("/submissions", protectAdmin, getSubmissions);


module.exports = router;