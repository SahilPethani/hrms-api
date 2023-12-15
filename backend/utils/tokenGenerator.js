const jwt = require('jsonwebtoken');
const secret_key = "ASkdcbgijhdTRamxdfbgnx"; // Use the same secret key as in your authRoutes.js

// Generate a JWT token with username, user ID, and role in the payload
function generateToken(user) {
  const payload = {
    username: user.username,
    userId: user._id,
    role: user.role,
  };
  const expiresInDays = 5;
  const expirationTimeInSeconds = expiresInDays * 24 * 60 * 60;

  return jwt.sign(payload, secret_key, { expiresIn: expirationTimeInSeconds });
}

// Verify a JWT token
function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, secret_key);
    return decoded;
  } catch (error) {
    throw new Error("Token verification failed");
  }
}

module.exports = {
  generateToken,
  verifyToken,
};
