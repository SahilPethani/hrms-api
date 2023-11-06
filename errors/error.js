const ErrorHander = require("../middleware/errorhander")

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Enternal Server Error";

    // Id error  
    if (err.name === "CastError") {
        const message = `Resorce not found. Invelid:${err.path}`;
        err = new ErrorHander(message, 404);
    }
    if (err.code && err.code === 11000) {
        const message = `Duplicate value entered for ${Object.keys(err.keyValue)} field, please choose another ${Object.keys(err.keyValue)}`
        err = new ErrorHander(message, 400);
    }
    if (err.name === "JsonWebTokenError") {
        const message = `json web token is invalid, try again`;
        err = new ErrorHander(message, 400);
    }
    if (err.name === "TokenExpiredError") {
        const message = `json web token is Expired, try again`;
        err = new ErrorHander(message, 400);
    }
    res.status(err.statusCode).json({
        status: err.statusCode,
        success: false,
        message: err.message
    })
}   