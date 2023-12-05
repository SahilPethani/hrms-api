const express = require("express");
const {
    authenticateUser,
    authorizePermission
} = require('../middleware/auth');
const { applyLeave, updateLeaveStatus, getAllLeaves, getLeaveById } = require("../controller/leavesController");

const router = express.Router();

router
    .route("/leave/apply")
    .post(authenticateUser, authorizePermission("employee"), applyLeave);

//admin
router
    .route("/leave/status-update")
    .put(authenticateUser, authorizePermission("admin"), updateLeaveStatus);

router
    .route("/leave/all")
    .get(authenticateUser, authorizePermission("admin"), getAllLeaves);

router
    .route("/leave/one/:id")
    .get(authenticateUser, authorizePermission("admin"), getLeaveById);

module.exports = router;
