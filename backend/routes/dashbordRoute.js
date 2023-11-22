const express = require("express");
const {
    authenticateUser,
    authorizePermission
} = require('../middleware/auth');
const { getEmployeeCounts } = require("../controller/dashbordController");
const FileUplaodToFirebase = require("../middleware/multerConfig");

const router = express.Router();

router
    .route("/admin/dashbord")
    .get(authenticateUser, authorizePermission("admin"), getEmployeeCounts);

module.exports = router;
