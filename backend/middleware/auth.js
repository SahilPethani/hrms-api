const ErrorHander = require("./errorhander");
const catchAsyncErrors = require("../errors/catchAsyncErrors")
const { isTokenValid } = require("../utils");

const authenticateUser = catchAsyncErrors(async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  // const { token } = req.cookies;
  if (!authorizationHeader) {
    return next(new ErrorHander("Please Login to access this resource"))
  }
  var bearer = authorizationHeader.split(" ");
  token = bearer[1];
  const { name, userId, role } = isTokenValid({ token });
  req.user = { name, userId, role };
  next()
})

const authorizePermission = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ErrorHander(`${req.user.role} is note allowed to access this resouce`, 403));
    }
    next();
  };
};

module.exports = {
  authenticateUser,
  authorizePermission
}