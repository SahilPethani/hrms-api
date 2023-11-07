const { createJWT, isTokenValid, attachCookiesToResponse } = require("./Jwt");
const createTokenUser = require("./CreateTokenUser");
// const checkPermission = require("./CheckPermission");
// const sendVerificationEmail = require("./SendVerificationEmail");
// const sendOTP = require("./SendOTP");
module.exports = {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
  createTokenUser,
  // checkPermission,
  // sendVerificationEmail,
  // sendOTP,
};
