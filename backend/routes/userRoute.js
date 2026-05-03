import express from "express";
import {
  isAuthenticated,
  loginUser,
  registerUser,
  resetPassword,
  sendResetOtp,
  sendVerifyOtp,
} from "../controllers/userController.js";

import authMiddleware from "../middleware/auth.js";

const userRouter = express.Router();

// ================= PUBLIC ROUTES =================
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/send-reset-otp", sendResetOtp);
userRouter.post("/reset-password", resetPassword);

// ================= PROTECTED ROUTES =================
userRouter.post("/send-verify-otp", authMiddleware, sendVerifyOtp);
userRouter.get("/is-auth", authMiddleware, isAuthenticated);

// ================= OPTIONAL =================
// Logout
userRouter.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });

  res.json({ success: true, message: "Logged out successfully" });
});

export default userRouter;