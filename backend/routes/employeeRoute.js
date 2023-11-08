const express = require("express")

const {
    authenticateUser,
    authorizePermission
} = require('../middleware/auth')
const { addEmployee } = require("../controller/employeeController")

const router = express.Router()

router
    .route("/employee/add")
    .post(authenticateUser, authorizePermission("employee"), addEmployee)

module.exports = router
