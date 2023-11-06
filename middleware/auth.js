const ErrorHander = require("./errorhander");
const { verifyToken } = require("../utils/tokenGenerator");

const authenticateUser = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  // const { token } = req.cookies;
  if (!authorizationHeader) {
    return next(new ErrorHander("Please Login to access this resource"));
  }
  var bearer = authorizationHeader.split(" ");
  const token = bearer[1];
  try {
    const { username, userId, role } = verifyToken(token); // Pass the token directly
    req.user = { username, userId, role };
    next();
  } catch (error) {
    return next(new ErrorHander("Invalid token"));
  }
};

const authorizePermission = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorHander(`${req.user.role} is not allowed to access this resource`, 403));
    }
    next();
  };
};

module.exports = {
  authenticateUser,
  authorizePermission,
};
