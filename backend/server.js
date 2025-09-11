const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require('mongoose');
const cors = require('cors');
const path = require("path");
// const bodyParser = require("body-parser"); // FIX 3: Removed redundant body-parser
const cookieParser = require('cookie-parser');
const cloudinary = require("cloudinary").v2;

const userRoute = require("./routes/userRoute");
const adminRoute = require("./routes/adminRoute");
const errorHandler = require("./middleware/errorMiddleware");

const app = express();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// MIDDLEWARE
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// CORS Configuration
app.use(
    cors({
         origin: ["http://localhost:3000", "http://localhost:5173"], // Allow both origins
    credentials: true, // Allow cookies to be sent
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Explicitly allow methods
    allowedHeaders: "Origin, X-Requested-With, Content-Type, Accept, Authorization", // Explicitly allow headers
    })
);

// ROUTES
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/users", userRoute);
app.use("/api/admins", adminRoute);

// Default Route
app.get("/", (req, res) => {
  res.json({ message: "KYC API is running!" });
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

//for checking CORS
app.get('/api/test', (req, res) => {
  res.json({ message: 'CORS is working!' });
});

// ERROR MIDDLEWARE (should be last)
app.use(errorHandler);

// START SERVER AND CONNECT TO DB
const PORT = process.env.PORT || 5000;
mongoose
    .connect(process.env.DATABASE_CLOUD)
    .then(() => {
        // Start the server only after a successful DB connection
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV}`);
        });
    })
    .catch((err) => {
        console.error("Database connection error:", err);
        process.exit(1);
    });
    
// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log("Unhandled Promise Rejection:", err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception:", err.message);
  process.exit(1);
});


