const express = require("express")
const router = express.Router()
const {
    getAllCountData
} = require("../controller/commenData")

const { authenticateUser, authorizePermission } = require("../middleware/auth")

router
    .route("/admin/commen/count")
    .get(authenticateUser, authorizePermission("admin"), getAllCountData)

module.exports = router 