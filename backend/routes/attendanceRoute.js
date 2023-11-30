// routes.js
const express = require('express');
const { getAttendanceDetails, getEmployeeAttendanceSummary, getAttendanceSheet, getTodayAttendance, getEmployeePunchesToday } = require('../controller/attendanceController');
const { authenticateUser, authorizePermission } = require('../middleware/auth');
const { punchIn, punchOut } = require('../controller/punchController');
const router = express.Router();

router.post('/punch-in/:id', authenticateUser, authorizePermission("employee"), punchIn);
router.post('/punch-out/:id', authenticateUser, authorizePermission("employee"), punchOut);

router.get('/attendance/summary', authenticateUser, authorizePermission("admin"), getEmployeeAttendanceSummary);
router.get('/attendance/sheet', authenticateUser, authorizePermission("admin"), getAttendanceSheet);
router.get('/attendance/today', authenticateUser, authorizePermission("admin"), getTodayAttendance);

router.get('/attendance/detail/:id', authenticateUser, getAttendanceDetails);
router.get('/attendance/today/:id', authenticateUser, getEmployeePunchesToday);

module.exports = router;
