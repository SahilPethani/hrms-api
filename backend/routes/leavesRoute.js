const express = require("express");
const {
    authenticateUser,
    authorizePermission
} = require('../middleware/auth');
const { applyLeave, updateLeaveStatus, getAllLeaves, getLeaveById, deleteLeave, getLeavesByEmployeeId } = require("../controller/leavesController");

const router = express.Router();

router
    .route("/leave/apply")
    .post(authenticateUser, authorizePermission("employee"), applyLeave);

router
    .route("/leave/delete/:id")
    .delete(authenticateUser, authorizePermission("employee"), deleteLeave);

//admin
router
    .route("/leave/status-update")
    .put(authenticateUser, authorizePermission("admin"), updateLeaveStatus);

router
    .route("/leave/all")
    .get(authenticateUser, authorizePermission("admin"), getAllLeaves);

router
    .route("/leave/one/:id")
    .get(authenticateUser, getLeaveById);

router
    .route("/leave/employee/:employeeId")
    .get(authenticateUser, authorizePermission("employee"), getLeavesByEmployeeId);


module.exports = router;
