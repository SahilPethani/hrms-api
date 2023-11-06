const User = require("../models/userModel");
const { StatusCodes } = require("http-status-codes");
const { generateToken } = require("../utils/tokenGenerator");
const ErrorHander = require("../middleware/errorhander");
const bcrypt = require('bcrypt');

const registerUser = async (req, res, next) => {
  try {
    const { username, password, email, role } = req.body;

    if (!username || !password || !email || !role) {
      return next(new ErrorHander("All fields are required for registration", 400));
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return next(new ErrorHander("Username is already in use", 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, role });

    await user.save();
    res.status(StatusCodes.CREATED)
      .json({
        status: StatusCodes.CREATED,
        success: true,
        message: `${user.role} registered successfully`,
      });
  } catch (error) {
    console.error("Error during registration:", error);
    return next(new ErrorHander("Registration failed", 500));
  }
}

const loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return next(new ErrorHander("All fields are required for login", 400));
    }

    const user = await User.findOne({ username }).select("+password");

    if (!user) {
      return next(new ErrorHander("Authentication failed", 401));
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      const userWithoutPassword = { ...user.toObject() };
      delete userWithoutPassword.password;

      const token = generateToken(user);
      res.status(200).json({
        status: 200,
        message: `${user.role} Loged In successfully`,
        user: userWithoutPassword,
        Token: token
      });
    } else {
      return next(new ErrorHander("Authentication failed", 401));
    }
  } catch (error) {
    console.error("Error during login:", error);
    return next(new ErrorHander("Authentication failed", 500));
  }
}

const logout = async (req, res, next) => {

  res.status(StatusCodes.OK).json({
    status: StatusCodes.OK,
    success: true,
    message: "User Log Out successfully",
  })
}

module.exports = {
  registerUser,
  loginUser
}