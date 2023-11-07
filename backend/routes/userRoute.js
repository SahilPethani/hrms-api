const express = require("express")
const {
    registerUser,
    loginUser,
    logout,
    frogotPassword,
    resetPassword,
    getUserDetails,
    updatePassword,
    updateProfile,
    getAllUser,
    getSingelUser,
    updateUserRole,
    deleteUser
} = require("../controller/userController")

const {
    authenticateUser,
    authorizePermission
} = require('../middleware/auth')

const router = express.Router()

router
    .route("/register")
    .post(registerUser)

router
    .route("/login")
    .post(loginUser)

router
    .route("/password/forgot")
    .post(frogotPassword)

router
    .route("/password/reset/:token")
    .put(resetPassword)

router
    .route("/me")
    .get(authenticateUser, getUserDetails)

router
    .route("/logout").get(logout)

router
    .route("/password/update")
    .post(authenticateUser, updatePassword)

router
    .route("/me/update")
    .put(authenticateUser, updateProfile)

// admin route

router
    .route("/admin/users")
    .get(authenticateUser, authorizePermission("admin"), getAllUser)

router
    .route("/admin/users/:id")
    .get(authenticateUser, authorizePermission("admin"), getSingelUser)
    .put(authenticateUser, authorizePermission("admin"), updateUserRole)
    .delete(authenticateUser, authorizePermission("admin"), deleteUser)

module.exports = router