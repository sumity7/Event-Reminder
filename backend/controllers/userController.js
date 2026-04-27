import userModal from "../models/userModel.js";
import bcrypt from "bcrypt";
import validator from "validator";
import jwt from "jsonwebtoken";

const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );
};

// function for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModal.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const token = createToken(user);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: true, message: error.message });
  }
};

// function for user register
const registerUser = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    const exists = await userModal.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User Already Exist" });
    }
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email!",
      });
    }
    if (!validator.isMobilePhone(phone, "en-IN")) {
      return res.json({
        success: false,
        message: "Please enter a valid phone number!",
      });
    }
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password!",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModal({
      name,
      phone,
      email,
      password: hashedPassword,
    });
    const user = await newUser.save();
    const token = createToken(user);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: true, message: error.message });
  }
};

export { loginUser, registerUser };
