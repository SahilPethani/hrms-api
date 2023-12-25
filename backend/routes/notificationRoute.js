const express = require("express")
const {
    sendNotification,
} = require("../controller/notificationController")

const {
    authenticateUser,
    authorizePermission
} = require('../middleware/auth')

const router = express.Router()

router
    .route("/send-notification")
    .post(sendNotification)

module.exports = router