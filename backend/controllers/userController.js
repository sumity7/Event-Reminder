import userModal from "../models/userModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken";
import transporter from "../config/nodemailer.js";

import {
  PASSWORD_RESET_TEMPLATE,
  EMAIL_VERIFY_TEMPLATE,
} from "../utils/emailTemplates.js";

// ================= TOKEN =================
const createToken = (user) => {
  return jwt.sign(
    { id: user._id, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ================= LOGIN =================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({ success: false, message: "Missing credentials" });
    }

    const user = await userModal.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = createToken(user);

    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= REGISTER =================
const registerUser = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    if (!name || !phone || !email || !password) {
      return res.json({ success: false, message: "Missing details" });
    }

    const normalizedEmail = email.toLowerCase();

    const exists = await userModal.findOne({ email: normalizedEmail });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    if (!validator.isEmail(normalizedEmail)) {
      return res.json({ success: false, message: "Invalid email" });
    }

    if (!validator.isMobilePhone(phone, "en-IN")) {
      return res.json({ success: false, message: "Invalid phone number" });
    }

    if (!validator.isStrongPassword(password)) {
      return res.json({ success: false, message: "Weak password" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModal.create({
      name,
      phone,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = createToken(user);

    res.json({
      success: true,
      token,
      userId: user._id, // important for verification
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= SEND VERIFY OTP =================
const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await userModal.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.verifyOtp = hashedOtp;
    user.verifyOtpExpireAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await user.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Verify your account",
      html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp),
    });

    res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= SEND RESET OTP =================
const sendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userModal.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const hashedOtp = await bcrypt.hash(otp, 10);

    user.resetOtp = hashedOtp;
    user.resetOtpExpireAt = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Reset Password OTP",
      html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp),
    });

    res.json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= RESET PASSWORD =================
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      return res.json({ success: false, message: "Missing details" });
    }

    if (newPassword !== confirmPassword) {
      return res.json({ success: false, message: "Passwords must match" });
    }

    if (!validator.isStrongPassword(newPassword)) {
      return res.json({ success: false, message: "Weak password" });
    }

    const user = await userModal.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const isValid = await bcrypt.compare(otp, user.resetOtp);

    if (!isValid) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = "";
    user.resetOtpExpireAt = null;

    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= AUTH CHECK =================
const isAuthenticated = async (req, res) => {
  res.json({ success: true });
};

export {
  loginUser,
  registerUser,
  sendVerifyOtp,
  sendResetOtp,
  resetPassword,
  isAuthenticated,
};