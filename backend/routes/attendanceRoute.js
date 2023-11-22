// routes.js
const express = require('express');
const { punchIn, punchOut } = require('../controller/attendanceController');
const { authenticateUser, authorizePermission } = require('../middleware/auth');
const router = express.Router();

router.post('/punch-in/:id',authenticateUser, authorizePermission("employee"),  punchIn);
router.post('/punch-out/:id',authenticateUser, authorizePermission("employee"),  punchOut);

module.exports = router;
