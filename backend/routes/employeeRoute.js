const express = require("express")

const {
    authenticateUser,
    authorizePermission
} = require('../middleware/auth')
const { addEmployee } = require("../controller/employeeController")
const FileUplaodToFirebase = require("../middleware/multerConfig");

const router = express.Router()

router
    .route("/employee/add")
    .post(authenticateUser, authorizePermission("employee"), FileUplaodToFirebase.uploadMulter.single("avatar"), addEmployee)

module.exports = router
