const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../middleware/errorhander");
const Employee = require("../models/employeeModel");
const Attendance = require("../models/attendanceModel");

const getEmployeeCounts = async (req, res, next) => {
    try {
        // const currentDate = new Date().toISOString().split('T')[0];
        const currentDateIST = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const currentDate = new Date(currentDateIST).setHours(0, 0, 0, 0);

        const totalEmployees = await Employee.countDocuments();
        const createUser_employee = await Employee.countDocuments({ create_user: 1 });
        const createEmployee = await Employee.countDocuments({ create_user: 0 });
        const active = await Employee.countDocuments({ status: 1 });
        const inActive = await Employee.countDocuments({ status: 0 });

        const employees = await Employee.find()

        const todayAttendance = [];

        for (const employee of employees) {
            const employeeAttendance = {
                _id: employee._id,
                present: false,
            };
            const todayAttendanceRecord = await Attendance.findOne({
                date: currentDate,
                "attendanceDetails.employeeId": employee._id,
            });
            if (todayAttendanceRecord) {
                const employeeDetails = todayAttendanceRecord.attendanceDetails.find(
                    (detail) => detail.employeeId.equals(employee._id)
                );
                if (employeeDetails.punches.length > 0) {
                    employeeAttendance.present = true;
                }
            }
            todayAttendance.push(employeeAttendance);
        }

        const presentCount = todayAttendance.filter(employee => employee.present).length;

        // Count the number of absent employees
        const absentCount = todayAttendance.filter(employee => !employee.present).length;


        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            data: {
                totalEmployees,
                createEmployee,
                createUser_employee,
                active,
                inActive,
                presentCount,
                absentCount
            },
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    getEmployeeCounts,
};
