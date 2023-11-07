const express = require("express")
const {
    authenticateUser,
    authorizePermission
} = require('../middleware/auth')
const { addToCart, getUserCartDetail, removeUserCartitem } = require("../controller/cartcontroller")

const router = express.Router()


router
    .route("/user/add-to-cart")
    .post(authenticateUser, authorizePermission("user"), addToCart)

router
    .route("/user/cart/:userId")
    .get(authenticateUser, getUserCartDetail)

router
    .route("/user/cart/:userId/:itemId")
    .delete(authenticateUser, removeUserCartitem)

module.exports = router
