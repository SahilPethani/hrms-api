// routes.js
const express = require('express');
const { punchIn, punchOut, getAttendanceDetails, getEmployeeAttendanceSummary, getAttendanceSheet } = require('../controller/attendanceController');
const { authenticateUser, authorizePermission } = require('../middleware/auth');
const router = express.Router();

router.post('/punch-in/:id',authenticateUser, authorizePermission("employee"),  punchIn);
router.post('/punch-out/:id',authenticateUser, authorizePermission("employee"),  punchOut);

router.get('/attendance/detail/:id',authenticateUser, authorizePermission("admin"),  getAttendanceDetails);
router.get('/attendance/summary',authenticateUser, authorizePermission("admin"),  getEmployeeAttendanceSummary);
router.get('/attendance/sheet',authenticateUser, authorizePermission("admin"),  getAttendanceSheet);

module.exports = router;
