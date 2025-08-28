const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const jwt=require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken =(id)=>{
    return jwt.sign({id},process.env.JWT_SECRET, { expiresIn: '1d',});
};
const registerUser = asyncHandler(async (req, res) => {
    // res.send("Register page")  // /api/users/register

    if (!req.body) {
        res.status(400);
        throw new Error("All fields are required");
    }
    
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please fill all required fields");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error("Email already in use");
    }

    const user= await User.create({
        name,
        email,
        password,
    });
    const token = generateToken(user.id);
    res .cookie('token', token, {
        path: '/',
        httpOnly: true,
        expires: new Date(Date.now() + 86400 * 1000), // 1 day
        sameSite: 'none',
        secure: true, // Set to true if using HTTPS
    });

    if(user){
        const {id, name, email,photo, role} = user;
        // Send the token in the response
        res.status(201).json({ _id: id, name, email, photo, role, token });
    }else{
        res.status(400);
        throw new Error("Invalid User data");   
    }
});


const logiUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error("Please provide an email and password");
    }

    const user = await User.findOne({ email });
    if (!user) {
        res.status(401); // User not found is an authorization failure
        throw new Error("Invalid credentials");
    }

    // FIX 1 (cont.): Use the correct variable name 'bcrypt'
    const passwordIsCorrect = await bcrypt.compare(password, user.password);

    if (passwordIsCorrect) {
        const token = generateToken(user._id);

        res.cookie('token', token, {
            path: '/',
            httpOnly: true,
            expires: new Date(Date.now() + 86400 * 1000), // 1 day
            sameSite: 'none',
            secure: true,
        });

        const { _id, name, photo, role } = user;
        // FIX 3: Use correct HTTP status 200 OK for login
        res.status(200).json({ _id, name, email, photo, role, token });
    } else {
        // FIX 2: Handle incorrect password properly
        res.status(401); // Incorrect password is an authorization failure
        throw new Error("Invalid credentials");
    }
});

const loginStatus = asyncHandler(async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json(false);
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if(verified){
        return res.json(true);
    }
    return res.json(false);
});

const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('token', '', {
        path: '/',
        httpOnly: true, 
        expires: new Date(0), 
        sameSite: 'none',
        secure: true, 
    });
    return res.status(200).json({ message: "User logged out successfully" });
});2

const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
});

const getAllUser = asyncHandler(async (req, res) => {
    const userList = await User.find({});

    if(!userList.length){
        res.status(404).json({message: "No users found"});
    }
    res.status(200).json(userList);
});


module.exports = {
    registerUser,
    logiUser,
    loginStatus,
    logoutUser,
    getUser,
    getAllUser,
};