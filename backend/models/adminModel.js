const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema({
    name: { type: String, required: [true, "Name is required"] },
    email: { type: String, required: [true, "Email is required"], unique: true },
    password: { type: String, required: [true, "Password is required"] },
    // --- NEW ADMIN-ONLY FIELD ---
    adminId: {
        type: String,
        required: [true, "Admin ID is required"],
        enum: ["Ad#2468", "Ad#1357"]
    },
    role: {
        type: String,
        default: 'admin'
    }
}, { timestamps: true });

// Hash password before saving
adminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;