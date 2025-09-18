const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require("socket.io");

const userRoute = require("./routes/userRoute");
const adminRoute = require("./routes/adminRoute");
const submissionRoute = require("./routes/submissionRoute");
const errorHandler = require("./middleware/errorMiddleware");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST", "PATCH"]
  }
});

app.set('socketio', io);

// MIDDLEWARE
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"],
  credentials: true,
}));

// ROUTES
app.use("/api/users", userRoute);
app.use("/api/admins", adminRoute);
app.use("/api/submissions", submissionRoute);

app.get("/", (req, res) => res.json({ message: "KYC Auth & Submission API (Node.js) is running!" }));
app.use(errorHandler);

io.on('connection', (socket) => {
  console.log('A client connected to WebSocket:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.DATABASE_CLOUD)
  .then(() => {
    server.listen(PORT, () => console.log(`Node.js Server is running on port ${PORT}`));
  })
  .catch((err) => console.error("Database connection error:", err));