const express = require("express")
const {
    authenticateUser,
    authorizePermission
} = require('../middleware/auth')
const {
    createAddress,
    getAddressDetails,
    updateAddressDetails,
    deleteAddress,
    getUserAddress,
    getAllAddress
} = require("../controller/userAddressController")

const router = express.Router()

router
    .route("/user/address")
    .post(authenticateUser, authorizePermission("user"), createAddress)

router
    .route("/user/address/:id")
    .get(authenticateUser, authorizePermission("user"), getAddressDetails)

router
    .route("/admin/address")
    .get(authenticateUser, authorizePermission("admin"), getAllAddress)

router
    .route("/user/me/address/:userId")
    .get(authenticateUser, authorizePermission("user"), getUserAddress)

router
    .route("/user/address/:id")
    .put(authenticateUser, authorizePermission("user"), updateAddressDetails)

router
    .route("/user/address/:id")
    .delete(authenticateUser, authorizePermission("user"), deleteAddress)

module.exports = router
