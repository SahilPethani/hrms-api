const express = require("express");

const {
    authenticateUser,
    authorizePermission
} = require('../middleware/auth');
const { loginUser, registerUser } = require("../controller/userController"); // Fix the case

const router = express.Router();

router
    .route("/auth/register")
    .post(registerUser);

router
    .route("/auth/login")
    .post(loginUser);

module.exports = router;
