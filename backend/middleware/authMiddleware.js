const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Admin=require('../models/adminModel');
const jwt=require('jsonwebtoken');

const protect = asyncHandler(async (req, res, next) => {
    try{
        const token =req.cookies.token
        if (!token) {
            res.status(401);
            throw new Error("Not authorized to access this page, please login");
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(verified.id).select("-password");

        if(!user){
            res.status(401);
            throw new Error("User not found");
        }
        req.user = user; 
        next(); 
    }catch (error) {
            res.status(401);
            throw new Error("Not authorized to access this page, please login");
        }
});

const protectAdmin = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            res.status(401);
            throw new Error("Not authorized as an admin, please login");
        }

        const verified = jwt.verify(token, process.env.JWT_SECRET);
        // Find the admin in the 'admins' collection
        const admin = await Admin.findById(verified.id).select("-password");

        if (!admin) {
            res.status(401); // User is not found in the admin collection
            throw new Error("Admin not found. Not authorized.");
        }
        
        // Also check if the user has the 'admin' role for extra security
        if (admin.role !== 'admin') {
            res.status(403); // 403 Forbidden
            throw new Error("Not authorized as an admin.");
        }
        
        req.user = admin; // Attach the admin user to the request object
        next();
    } catch (error) {
        res.status(401);
        throw new Error("Not authorized, token failed or invalid.");
    }
});


module.exports = { 
    protect, 
    protectAdmin,
 };