const express = require('express');
const { registerUser, logiUser, loginStatus, logoutUser, getUser } = require('../controllers/userCtr');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", logiUser);
router.post("/loggedin", loginStatus);
router.get("/logout", logoutUser);
router.get("/getuser", protect, getUser);

module.exports = router;
