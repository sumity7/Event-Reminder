import React, { useContext, useState, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AppContext from "../context/AppContext";

const ResetPassword = () => {
  const { navigate, backendUrl } = useContext(AppContext);

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef([]);

  // ===== OTP INPUT =====
  const handleInput = (e, index) => {
    if (e.target.value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").slice(0, 6);
    paste.split("").forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  // ===== STEP 1: SEND OTP =====
  const onSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await axios.post(`${backendUrl}/user/send-reset-otp`, {
        email,
      });

      if (data.success) {
        toast.success(data.message);
        setIsEmailSent(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== STEP 2: VERIFY OTP =====
  const onSubmitOtp = (e) => {
    e.preventDefault();

    const enteredOtp = inputRefs.current.map((el) => el.value).join("");

    if (enteredOtp.length !== 6) {
      return toast.error("Enter complete 6-digit OTP");
    }

    setOtp(enteredOtp);
    setIsOtpVerified(true);
  };

  // ===== STEP 3: RESET PASSWORD =====
  const onSubmitNewPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setLoading(true);
      const { data } = await axios.post(`${backendUrl}/user/reset-password`, {
        email,
        otp,
        newPassword,
        confirmPassword,
      });

      if (data.success) {
        toast.success(data.message);
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* ===== STEP 1: EMAIL ===== */}
      {!isEmailSent && (
        <form
          onSubmit={onSubmitEmail}
          className="flex flex-col items-center w-[90%] border p-10 rounded-2xl sm:max-w-96 m-auto mt-14 gap-4"
        >
          <h2 className="text-xl font-semibold">Reset Password</h2>
          <p className="text-gray-600 text-sm">
            Enter your email to receive OTP
          </p>

          <input
            type="email"
            placeholder="Email"
            required
            className="w-full px-3 py-2 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button className="bg-black text-white py-2 rounded w-full">
            {loading ? "loading..." : "Send OTP"}
          </button>
        </form>
      )}

      {/* ===== STEP 2: OTP ===== */}
      {isEmailSent && !isOtpVerified && (
        <form
          onSubmit={onSubmitOtp}
          className="flex flex-col items-center w-[90%] border p-10 rounded-2xl sm:max-w-96 m-auto mt-14 gap-4"
        >
          <h2 className="text-xl font-semibold">Enter OTP</h2>
          <p className="text-gray-600 text-sm">
            Enter the 6-digit code sent to your email
          </p>

          <div className="flex gap-2" onPaste={handlePaste}>
            {Array(6)
              .fill(0)
              .map((_, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  className="w-10 h-10 text-center border text-lg rounded"
                  ref={(el) => (inputRefs.current[index] = el)}
                  onInput={(e) => handleInput(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  required
                />
              ))}
          </div>

          <button className="bg-black text-white py-2 rounded w-full">
            {loading ? "loading..." : "Verify OTP"}
          </button>
        </form>
      )}

      {/* ===== STEP 3: NEW PASSWORD ===== */}
      {isEmailSent && isOtpVerified && (
        <form
          onSubmit={onSubmitNewPassword}
          className="flex flex-col items-center w-[90%] border p-10 rounded-2xl sm:max-w-96 m-auto mt-14 gap-4"
        >
          <h2 className="text-xl font-semibold">New Password</h2>

          <input
            type="password"
            placeholder="New Password"
            required
            className="w-full px-3 py-2 border rounded"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            required
            className="w-full px-3 py-2 border rounded"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button className="bg-black text-white py-2 rounded w-full">
            {loading ? "loading..." : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
