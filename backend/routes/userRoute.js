const express = require("express")
const {
    registerUser,
    loginUser,
    logout,
} = require("../controller/userController")
const FileUplaodToFirebase = require("../middleware/multerConfig");

const {
    authenticateUser,
    authorizePermission
} = require('../middleware/auth')

const router = express.Router()

router
    .route("/auth/register")
    .post(FileUplaodToFirebase.uploadMulter.single("avatar"), registerUser)

router
    .route("/auth/login")
    .post(loginUser)

router
    .route("/logout").get(logout)

module.exports = router