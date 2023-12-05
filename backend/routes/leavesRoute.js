const express = require("express");
const {
    authenticateUser,
    authorizePermission
} = require('../middleware/auth');
const { applyLeave } = require("../controller/leavesController");

const router = express.Router();

router
    .route("/leave/apply")
    .post(authenticateUser, authorizePermission("employee"), applyLeave);

//admin
router
    .route("/leave/staus")
    .post(authenticateUser, authorizePermission("employee"), applyLeave);


module.exports = router;
