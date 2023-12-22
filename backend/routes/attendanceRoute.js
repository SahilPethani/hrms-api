// routes.js
const express = require('express');
const { getAttendanceDetails, getEmployeeAttendanceSummary, getAttendanceSheet, getTodayAttendance, getEmployeePunchesToday, getEmployeeAttendanceDetails, getEmployeeAttendanceList, getWeeklyEmployeeAttendanceCount, getAllAttendance } = require('../controller/attendanceController');
const { authenticateUser, authorizePermission } = require('../middleware/auth');
const { punchIn, punchOut, breakIn, breakOut, addManualAttendance } = require('../controller/punchController');
const router = express.Router();

router.post('/punch-in/:id', authenticateUser, authorizePermission("employee"), punchIn);
router.post('/punch-out/:id', authenticateUser, authorizePermission("employee"), punchOut);

router.post('/break-in/:id', authenticateUser, authorizePermission("employee"), breakIn);
router.post('/break-out/:id', authenticateUser, authorizePermission("employee"), breakOut);

router.post('/attendance/manual/:id', authenticateUser, authorizePermission("admin"), addManualAttendance);

// get dummary for date vise absent and presnet
router.get('/attendance/summary', authenticateUser, authorizePermission("admin"), getEmployeeAttendanceSummary);

// get attendence sheet for curent month
router.get('/attendance/sheet', authenticateUser, authorizePermission("admin"), getAttendanceSheet);

//get today absent and present
router.get('/attendance/today', authenticateUser, authorizePermission("admin"), getTodayAttendance);

// get graf valu for in admin dashbord
router.get('/attendance/week', authenticateUser, authorizePermission("admin"), getWeeklyEmployeeAttendanceCount);

// get all asttendence for all in collection of attencdence
router.get('/attendance/all', authenticateUser, authorizePermission("admin"), getAllAttendance);

// get attendence detail vith everage 
router.get('/attendance/detail/:id', authenticateUser, getAttendanceDetails);

// punch detali for today punchiss for perticuler employee
router.get('/attendance/today/:id', authenticateUser, getEmployeePunchesToday);

//
router.get('/attendance/employee/:id', authenticateUser, getEmployeeAttendanceDetails);
router.get('/attendance/employee/list/:id', authenticateUser, getEmployeeAttendanceList);

module.exports = router;
