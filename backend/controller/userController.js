const User = require("../models/userModel");
const { StatusCodes } = require("http-status-codes");
const { generateToken } = require("../utils/tokenGenerator");
const ErrorHandler = require("../middleware/errorhander");
const FileUplaodToFirebase = require("../middleware/multerConfig");
const employeeModel = require("../models/employeeModel");

const registerUser = async (req, res, next) => {
  try {
    const { user_id, username, password, role } = req.body;

    if (!username || !password || !role) {
      return next(new ErrorHandler("All fields are required for registration", StatusCodes.BAD_REQUEST));
    }

    const existingUser = await User.findOne({ user_id });

    if (existingUser) {
      return next(new ErrorHandler("User Id is already in use", StatusCodes.BAD_REQUEST));
    }

    const avatar = req.file;

    if (!avatar) {
      return next(new ErrorHandler("Avatar image is required", StatusCodes.BAD_REQUEST));
    }

    let certificateDownloadURL = await FileUplaodToFirebase.uploadCertifiesToFierbase(avatar);


    // const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ user_id, username, password, role, avatar: certificateDownloadURL, });

    await user.save();

    return res.status(StatusCodes.CREATED).json({
      status: StatusCodes.CREATED,
      success: true,
      message: `${user.role} registered successfully`,
    });
  } catch (error) {
    console.error("Error during registration:", error);
    return next(new ErrorHandler("Registration failed", StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { user_id, password, fcmToken } = req.body;

    if (!user_id || !password) {
      return next(new ErrorHandler("All fields are required for login", StatusCodes.BAD_REQUEST));
    }

    const user = await User.findOne({ user_id }).select("+password");

    if (!user) {
      return next(new ErrorHandler("Authentication failed", StatusCodes.UNAUTHORIZED));
    }

    const isPasswordValid = await user.comparePassword(password);
    const employeeData = await employeeModel.findOne(
      { user_id: user_id },
      { _id: 1, user_id: 1, first_name: 1, last_name: 1, designation: 1 /* Add other fields you want to include */ }
    );

    if (isPasswordValid) {
      // Update the user's FCM token at login time
      if (fcmToken) {
        user.fcmToken = fcmToken;
        await user.save();
      }

      const userWithoutPassword = { ...user.toObject() };
      delete userWithoutPassword.password;

      const token = generateToken(user);
      return res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        message: `${user.role} logged in successfully`,
        user: userWithoutPassword,
        employeeData: employeeData ? employeeData : "",
        Token: token
      });
    } else {
      return next(new ErrorHandler("Authentication failed", StatusCodes.UNAUTHORIZED));
    }
  } catch (error) {
    console.error("Error during login:", error);
    return next(new ErrorHandler("Authentication failed", StatusCodes.INTERNAL_SERVER_ERROR));
  }
};

const getallUser = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page_no) || 1;
    const perPage = parseInt(req.query.items_per_page) || 10;

    const { search_text } = req.query;

    const query = search_text ? { $or: [{ username: { $regex: search_text, $options: 'i' } }, { user_id: { $regex: search_text, $options: 'i' } }] } : {};

    const skip = (page - 1) * perPage;
    const users = await User.find(query)
      .skip(skip)
      .limit(perPage);
    const totalUsers = await User.countDocuments(query);
    const allUsers = await User.countDocuments()

    const totalPages = Math.ceil(totalUsers / perPage);

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      success: true,
      data: users,
      pagination: {
        total_items: allUsers,
        total_pages: totalPages,
        current_page_item: users.length,
        page_no: parseInt(page),
        items_per_page: parseInt(perPage),
      },
    });
  } catch (error) {
    return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
  }
}

const logout = async (req, res, next) => {
  return res.status(StatusCodes.OK).json({
    status: StatusCodes.OK,
    success: true,
    message: "User logged out successfully",
  });
};

module.exports = {
  registerUser,
  loginUser,
  logout
};
