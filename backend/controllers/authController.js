import User from "../models/User.js";
import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ message: "Invalid token" });

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(400).json({ message: "Token expired or invalid" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        message:
          "If an account with that email exists, you will receive a reset link shortly.",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const resetLink = `http://localhost:5173/reset-password/${token}`;

    await sendEmail({
      to: user.email,
      subject: "Reset your password",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>`,
    });

    res.status(200).json({ message: "Reset email sent." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
};

export const signup = async (req, res) => {
  try {
    const { name, email, password, role = "user" } = req.body;

    // Check if user already exists in the respective collection
    const existingUser =
      role === "admin"
        ? await Admin.findOne({ email })
        : await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: `${role} already exists` });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save to appropriate model
    if (role === "admin") {
      const admin = new Admin({
        name,
        email,
        password: hashedPassword,
      });
      await admin.save();

      return res.status(201).json({
        message: "Admin account created",
        userId: admin._id,
        role: "admin",
      });
    } else {
      const user = new User({
        name,
        email,
        password: hashedPassword,
      });
      await user.save();

      return res.status(201).json({
        message: "User account created",
        userId: user._id,
        role: "user",
      });
    }
  } catch (error) {
    console.error("🔥 Signup error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    console.log("📩 Login attempt:", email, "Role:", role);

    let user;

    if (role === "admin") {
      user = await Admin.findOne({ email });
    } else {
      user = await User.findOne({ email });
    }

    if (!user) {
      console.log("❌ No user found with this email in", role, "collection");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("✅ User found:", user.email);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔑 Password match result:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.status(200).json({
      message: "Login successful",
      userId: user._id,
      token,
      role,
    });
  } catch (error) {
    console.error("🔥 Login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
