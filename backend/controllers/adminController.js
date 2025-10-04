const asyncHandler = require("express-async-handler");
const Admin = require("../models/adminModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// Register 
const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, adminId } = req.body;

  if (!name || !email || !password || !adminId) {
    res.status(400);
    throw new Error("Please fill all required fields, including Admin ID");
  }

  // valid adminId
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
    res.status(201).json({
      token: generateToken(admin._id, admin.role),
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        adminId: admin.adminId,
      },
    });
  } else {
    res.status(400);
    throw new Error("Invalid admin data");
  }
});

// Login Admin 
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password, adminId } = req.body;

  if (!email || !password || !adminId) {
    res.status(400);
    throw new Error("Please provide email, password, and Admin ID");
  }

  // Find admin 
  const admin = await Admin.findOne({ email });

  // Verify credentials
  if (admin && (await bcrypt.compare(password, admin.password)) && admin.adminId === adminId) {
    const token = generateToken(admin._id, admin.role);

    // Send response with token + user object
    res.status(200).json({
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        adminId: admin.adminId,
      },
    });
  } else {
    res.status(401);
    throw new Error("Invalid Admin credentials");
  }
});
module.exports = { registerAdmin, loginAdmin };
