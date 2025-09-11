const asyncHandler = require('express-async-handler');
const Admin = require('../models/adminModel'); // <-- Use the new Admin model
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// --- Register Admin Logic ---
const registerAdmin = asyncHandler(async (req, res) => {
    const { name, email, password, adminId } = req.body;

    if (!name || !email || !password || !adminId) {
        res.status(400);
        throw new Error("Please fill all required fields, including Admin ID");
    }

    // The 'enum' in the model already validates the adminId, but an extra check is good
    if (!["Ad#2468", "Ad#1357"].includes(adminId)) {
        res.status(400);
        throw new Error("Invalid Admin ID provided.");
    }

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
        res.status(400);
        throw new Error("Admin with this email already exists");
    }

    const admin = await Admin.create({ name, email, password, adminId });

    if (admin) {
        res.status(201).json({ _id: admin._id, name: admin.name, email: admin.email, role: admin.role });
    } else {
        res.status(400);
        throw new Error("Invalid admin data");
    }
});

// --- Login Admin Logic ---
const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password, adminId } = req.body;

    if (!email || !password || !adminId) {
        res.status(400);
        throw new Error("Please provide email, password, and Admin ID");
    }
    
    // Find the admin in the 'admins' collection
    const admin = await Admin.findOne({ email });

    // Verify the admin exists, the password is correct, AND the Admin ID matches
    if (admin && (await bcrypt.compare(password, admin.password)) && admin.adminId === adminId) {
        const token = generateToken(admin._id, admin.role);
        res.cookie('token', token, {
            path: '/', httpOnly: true, expires: new Date(Date.now() + 86400 * 1000),
            sameSite: 'none', secure: true
        });
        
        res.status(200).json({ _id: admin._id, name: admin.name, email: admin.email, role: admin.role, token });
    } else {
        res.status(401);
        throw new Error("Invalid Admin credentials");
    }
});

module.exports = { registerAdmin, loginAdmin };