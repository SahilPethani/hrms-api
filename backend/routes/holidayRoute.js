const express = require("express");
const {
    authenticateUser,
    authorizePermission
} = require('../middleware/auth');
const { addHoliday, getAllHolidays, getHolidayById, updateHoliday, deleteHoliday, getCurrentMonthHolidays, getAllHolidaysEmployee } = require("../controller/holidayController");

const router = express.Router();

router
    .route("/holiday/add")
    .post(authenticateUser, authorizePermission("admin"), addHoliday);

router
    .route("/holiday/all")
    .get(authenticateUser, authorizePermission("admin"), getAllHolidays);

router
    .route("/holiday/:id")
    .get(authenticateUser, authorizePermission("admin"), getHolidayById);

router
    .route("/holiday/edit/:id")
    .put(authenticateUser, authorizePermission("admin"), updateHoliday);

router
    .route("/holiday/delete/:id")
    .delete(authenticateUser, authorizePermission("admin"), deleteHoliday);

router
    .route("/holiday/currentmonth")
    .get(authenticateUser, authorizePermission("admin"), getCurrentMonthHolidays);

router
    .route("/holiday/employee/currentmonth")
    .get(authenticateUser, getAllHolidaysEmployee);

module.exports = router;
