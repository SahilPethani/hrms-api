const express = require("express")

const {
    authenticateUser,
    authorizePermission
} = require('../middleware/auth')
const { addEmployee, getAllEmployees, getEmployeeById } = require("../controller/employeeController")
const FileUplaodToFirebase = require("../middleware/multerConfig");

const router = express.Router()

router
    .route("/employee/add")
    .post(authenticateUser, authorizePermission("employee"), FileUplaodToFirebase.uploadMulter.single("avatar"), addEmployee)

router
    .route("/employee/all")
    .post(authenticateUser, authorizePermission("employee"), getAllEmployees)

router
    .route("/employee/:id")
    .post(authenticateUser, authorizePermission("employee"), getEmployeeById)

module.exports = router
