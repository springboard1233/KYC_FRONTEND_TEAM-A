const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Admin = require('../models/adminModel');
const jwt = require('jsonwebtoken');

// Middleware to protect normal users
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user from DB
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Middleware to protect admins
const protectAdmin = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
    //   console.log("🔑 Received token:", token);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //   console.log("✅ Decoded token:", decoded);

      const admin = await Admin.findById(decoded.id).select('-password');
      if (!admin) {
        console.log("❌ Admin not found in DB");
        res.status(403);
        throw new Error('Not authorized as an admin');
      }

      if (admin.role !== 'admin') {
        console.log("❌ Role mismatch:", admin.role);
        res.status(403);
        throw new Error('Not authorized as an admin');
      }

      req.admin = admin;
      req.user=admin;
      next();
    } catch (error) {
      console.error("❌ JWT error:", error.message);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});


module.exports = { protect, protectAdmin };



