const User = require("../models/userModel");
const { StatusCodes } = require("http-status-codes");
const { generateToken } = require("../utils/tokenGenerator");
const ErrorHander = require("../middleware/errorhander");
const bcrypt = require('bcryptjs');

const registerUser = async (req, res, next) => {
  try {
    const { username, password, email, role } = req.body;

    if (!username || !password || !email || !role) {
      return next(new ErrorHander("All fields are required for registration", StatusCodes.BAD_REQUEST));
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return next(new ErrorHander("Username is already in use", StatusCodes.BAD_REQUEST));
    }

    // const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password, role });

    await user.save();

    return res.status(StatusCodes.CREATED).json({
      status: StatusCodes.CREATED,
      success: true,
      message: `${user.role} registered successfully`,
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return next(new ErrorHander("Registration failed", StatusCodes.INTERNAL_SERVER_ERROR));
  }
}

const loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return next(new ErrorHander("All fields are required for login", StatusCodes.BAD_REQUEST));
    }

    const user = await User.findOne({ username }).select("+password");

    if (!user) {
      return next(new ErrorHander("Authentication failed", StatusCodes.UNAUTHORIZED));
    }

    const isPasswordValid = await user.comparePassword(password);
    // const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      const userWithoutPassword = { ...user.toObject() };
      delete userWithoutPassword.password;

      const token = generateToken(user);
      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: `${user.role} logged in successfully`,
        user: userWithoutPassword,
        Token: token
      });
    } else {
      return next(new ErrorHander("Authentication failed", StatusCodes.UNAUTHORIZED));
    }
  } catch (error) {
    console.error("Error during login:", error);
    return next(new ErrorHander("Authentication failed", StatusCodes.INTERNAL_SERVER_ERROR));
  }
}

const logout = async (req, res, next) => {
  return res.status(StatusCodes.OK).json({
    status: StatusCodes.OK,
    success: true,
    message: "User logged out successfully",
  });
}

module.exports = {
  registerUser,
  loginUser,
  logout
};
