const ErrorHander = require("../middleware/errorhander");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  if (err.name === "CastError") {
    const message = `Resource not found. Invalid ID: ${err.value}`;
    err = new ErrorHander(message, 404);
  } else if (err.code && err.code === 11000) {
    const key = Object.keys(err.keyValue)[0];
    const message = `Duplicate value entered for the '${key}' field. Please choose another value for '${key}'.`;
    err = new ErrorHander(message, 400);
  } else if (err.name === "JsonWebTokenError") {
    const message = "JSON Web Token is invalid. Please try again.";
    err = new ErrorHander(message, 400);
  } else if (err.name === "TokenExpiredError") {
    const message = "JSON Web Token has expired. Please try again.";
    err = new ErrorHander(message, 400);
  }

  // Log the error for debugging (you can use a logging library or service)
  console.error(err);

  res.status(err.statusCode).json({
    status: err.statusCode,
    success: false,
    message: err.message
  });
}
