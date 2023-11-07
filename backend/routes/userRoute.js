const express = require("express")
const {
    registerUser,
    loginUser,
    logout,
} = require("../controller/userController")

const {
    authenticateUser,
    authorizePermission
} = require('../middleware/auth')

const router = express.Router()

router
    .route("/auth/register")
    .post(registerUser)

router
    .route("/auth/login")
    .post(loginUser)

router
    .route("/logout").get(logout)

// admin route

router
//     .route("/admin/users")
//     .get(authenticateUser, authorizePermission("admin"), getAllUser)

// router
//     .route("/admin/users/:id")
//     .get(authenticateUser, authorizePermission("admin"), getSingelUser)
//     .put(authenticateUser, authorizePermission("admin"), updateUserRole)
//     .delete(authenticateUser, authorizePermission("admin"), deleteUser)

module.exports = router