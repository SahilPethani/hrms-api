const express = require("express");
const {
    authenticateUser,
    authorizePermission
} = require('../middleware/auth');
const { addEmployee, getAllEmployees, getEmployeeById, updateEmployee } = require("../controller/employeeController");
const FileUplaodToFirebase = require("../middleware/multerConfig");

const router = express.Router();

router
    .route("/employee/add")
    .post(authenticateUser, authorizePermission("admin"), FileUplaodToFirebase.uploadMulter.single("avatar"), addEmployee);

router
    .route("/employee/all")
    .get(authenticateUser, authorizePermission("admin"), getAllEmployees);

router
    .route("/employee/:id")
    .get(authenticateUser, authorizePermission("admin"), getEmployeeById);

router
    .route("/employee/edit/:id")
    .put(authenticateUser, authorizePermission("admin"), FileUplaodToFirebase.uploadMulter.single("avatar"), updateEmployee);

module.exports = router;
