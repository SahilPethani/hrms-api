const ErrorHander = require("./errorhander");
const { verifyToken } = require("../utils/tokenGenerator");

const authenticateUser = async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader) {
    return next(new ErrorHander("Please log in to access this resource", 401));
  }

  const bearer = authorizationHeader.split(" ");
  // const token = bearer[1];
  const token = req.headers.authorization.split(' ')[0];

  try {
    const { username, userId, role } = verifyToken(token);
    req.user = { username, userId, role };
    next();
  } catch (error) {
    return next(new ErrorHander("Invalid token, Please Log-Out and Log-In again", 401));
  }
}; 

const authorizePermission = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorHander(`You do not have permission to access this resource`, 403));
    }
    next();
  };
};

module.exports = {
  authenticateUser,
  authorizePermission,
};
