// routes.js
const express = require('express');
const { punchIn, punchOut, getAttendanceDetails, getEmployeeAttendanceSummary } = require('../controller/attendanceController');
const { authenticateUser, authorizePermission } = require('../middleware/auth');
const router = express.Router();

router.post('/punch-in/:id',authenticateUser, authorizePermission("employee"),  punchIn);

router.post('/punch-out/:id',authenticateUser, authorizePermission("employee"),  punchOut);

router.get('/attendance-detail/:id',authenticateUser, authorizePermission("admin"),  getAttendanceDetails);
router.get('/attendance-Summary',authenticateUser, authorizePermission("admin"),  getEmployeeAttendanceSummary);

module.exports = router;
