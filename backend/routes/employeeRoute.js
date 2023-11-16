const express = require("express")

const {
    authenticateUser,
    authorizePermission
} = require('../middleware/auth')
const { addEmployee, getAllEmployees, getEmployeeById, updateEmployee } = require("../controller/employeeController")
const FileUplaodToFirebase = require("../middleware/multerConfig");

const router = express.Router()

router
    .route("/employee/add")
    .post(authenticateUser, authorizePermission("employee"), FileUplaodToFirebase.uploadMulter.single("avatar"), addEmployee)

router
    .route("/employee/all")
    .get(authenticateUser, authorizePermission("employee"), getAllEmployees)

router
    .route("/employee/:id")
    .get(authenticateUser, authorizePermission("employee"), getEmployeeById)

router
    .route("/employee/edit/:id")
    .put(authenticateUser, authorizePermission("employee"), updateEmployee)

module.exports = router
