const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../middleware/errorhander");
const Employee = require("../models/employeeModel");
const Attendance = require("../models/attendanceModel");
const Holiday = require("../models/holidayModel");

const punchIn = async (req, res, next) => {
    try {
        const employeeId = req.params.id;
        const note = req.body.note;

        let employee = await Employee.findById(employeeId);
        if (!employee) {
            return next(new ErrorHandler(`Employee not found with id ${employeeId}`, StatusCodes.NOT_FOUND));
        }
        const currentDateIST = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const currentDate = new Date(currentDateIST).setHours(0, 0, 0, 0);

        // const currentDateIST = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const isHoliday = await Holiday.exists({ holiday_date: new Date(currentDate) });

        if (isHoliday) {
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                success: true,
                message: `It's a holiday. Employees don't need to punch in.`,
            });
        }

        let todayAttendance = await Attendance.findOne({
            date: currentDate,
            "attendanceDetails.employeeId": employee._id,
        });

        if (!todayAttendance) {
            todayAttendance = await Attendance.findOneAndUpdate(
                { date: currentDate },
                {
                    $addToSet: {
                        attendanceDetails: {
                            employeeId: employee._id,
                            present: 1,
                            punches: [],
                        },
                    },
                },
                { upsert: true, new: true }
            );
        }

        const punchInDetails = {
            type: "punchIn",
            punch_time: new Date(),
            note: note,
        };

        const employeeAttendanceDetailsIndex = todayAttendance.attendanceDetails.findIndex(
            (detail) => detail.employeeId.equals(employee._id)
        );

        if (employeeAttendanceDetailsIndex !== -1) {
            todayAttendance.attendanceDetails[employeeAttendanceDetailsIndex].punches.push(punchInDetails);
            todayAttendance.attendanceDetails[employeeAttendanceDetailsIndex].present = 1;
        }

        await todayAttendance.save();

        const existingAttendanceIndex = employee.attendances.findIndex(
            (attendance) => attendance.date.toISOString() === todayAttendance.date.toISOString()
        );

        if (existingAttendanceIndex !== -1) {
            employee.attendances[existingAttendanceIndex].punches = todayAttendance.attendanceDetails[employeeAttendanceDetailsIndex].punches;
        } else {
            const attendanceData = {
                date: todayAttendance.date,
                present: todayAttendance.attendanceDetails[employeeAttendanceDetailsIndex].present,
                punches: todayAttendance.attendanceDetails[employeeAttendanceDetailsIndex].punches,
            };
            employee.attendances.push(attendanceData);
        }

        await employee.save();

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Employee punched in successfully`,
            date: currentDateIST
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const punchOut = async (req, res, next) => {
    try {
        const employeeId = req.params.id;
        const note = req.body.note;

        let employee = await Employee.findById(employeeId);
        if (!employee) {
            return next(new ErrorHandler(`Employee not found with id ${employeeId}`, StatusCodes.NOT_FOUND));
        }
        const currentDateIST = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const currentDate = new Date(currentDateIST).setHours(0, 0, 0, 0);

        let todayAttendance = await Attendance.findOne({
            date: currentDate,
            "attendanceDetails.employeeId": employee._id,
        });


        if (!todayAttendance) {
            return next(new ErrorHandler(`Employee has not punched-in today`, StatusCodes.BAD_REQUEST));
        }

        const hasPunchIn = todayAttendance.attendanceDetails[0].punches.some(punch => punch.type === 'punchIn');

        if (!hasPunchIn) {
            return next(new ErrorHandler(`Employee has not punched in today`, StatusCodes.BAD_REQUEST));
        }

        const punchOutDetails = {
            type: "punchOut",
            punch_time: new Date(),
            note: note,
        };

        const employeeAttendanceDetailsIndex = todayAttendance.attendanceDetails.findIndex(
            (detail) => detail.employeeId.equals(employee._id)
        );

        if (employeeAttendanceDetailsIndex !== -1) {
            todayAttendance.attendanceDetails[employeeAttendanceDetailsIndex].punches.push(punchOutDetails);
            // todayAttendance.attendanceDetails[employeeAttendanceDetailsIndex].present = 0;
        }

        await todayAttendance.save();

        const existingAttendanceIndex = employee.attendances.findIndex(
            (attendance) => attendance.date.toISOString() === todayAttendance.date.toISOString()
        );

        if (existingAttendanceIndex !== -1) {
            employee.attendances[existingAttendanceIndex].punches = todayAttendance.attendanceDetails[employeeAttendanceDetailsIndex].punches;
        } else {
            const attendanceData = {
                date: todayAttendance.date,
                present: todayAttendance.attendanceDetails[employeeAttendanceDetailsIndex].present,
                punches: todayAttendance.attendanceDetails[employeeAttendanceDetailsIndex].punches,
            };
            employee.attendances.push(attendanceData);
        }

        await employee.save();

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Employee punched out successfully`,
            date: currentDateIST
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const addPunchForHoliday = async (date) => {
    try {
        const employees = await Employee.find();

        for (const employee of employees) {
            const todayAttendance = await Attendance.findOne({
                date,
                "attendanceDetails.employeeId": employee._id,
            });

            if (!todayAttendance) {
                await Attendance.findOneAndUpdate(
                    { date },
                    {
                        $addToSet: {
                            attendanceDetails: {
                                employeeId: employee._id,
                                present: 0,
                                punches: [{
                                    type: "holiday",
                                    punchIn: date,
                                    note: "",
                                }],
                            },
                        },
                    },
                    { upsert: true, new: true }
                );

                // Update Employee model
                const attendanceData = {
                    date,
                    present: 0,
                    punches: [{
                        type: "holiday",
                        punch_time: date,
                        note: "",
                    }],
                };
                employee.attendances.push(attendanceData);
                await employee.save();
            } else {
                const employeeAttendanceDetailsIndex = todayAttendance.attendanceDetails.findIndex(
                    (detail) => detail.employeeId.equals(employee._id)
                );

                if (employeeAttendanceDetailsIndex !== -1) {
                    todayAttendance.attendanceDetails[employeeAttendanceDetailsIndex].punches.push({
                        type: "holiday",
                        punch_time: date,
                        note: "",
                    });
                    todayAttendance.attendanceDetails[employeeAttendanceDetailsIndex].present = 0;
                }

                await todayAttendance.save();

                // Update Employee model
                const attendanceData = {
                    date,
                    present: 0,
                    punches: [{
                        type: "holiday",
                        punch_time: date,
                        note: "",
                    }],
                };
                employee.attendances.push(attendanceData);
                await employee.save();
            }
        }
    } catch (error) {
        console.error("Error adding holiday punch:", error);
    }
};

const addPunchWeekend = async (date) => {
    try {
        const employees = await Employee.find();

        for (const employee of employees) {
            const todayAttendance = await Attendance.findOne({
                date,
                "attendanceDetails.employeeId": employee._id,
            });

            if (!todayAttendance) {
                await Attendance.findOneAndUpdate(
                    { date },
                    {
                        $addToSet: {
                            attendanceDetails: {
                                employeeId: employee._id,
                                present: 0,
                                punches: [{
                                    type: "weekend",
                                    punch_time: date,
                                    note: "",
                                }],
                            },
                        },
                    },
                    { upsert: true, new: true }
                );

                // Update Employee model
                const attendanceData = {
                    date,
                    present: 0,
                    punches: [{
                        type: "weekend",
                        punch_time: date,
                        note: "",
                    }],
                };
                employee.attendances.push(attendanceData);
                await employee.save();
            } else {
                const employeeAttendanceDetailsIndex = todayAttendance.attendanceDetails.findIndex(
                    (detail) => detail.employeeId.equals(employee._id)
                );

                if (employeeAttendanceDetailsIndex !== -1) {
                    todayAttendance.attendanceDetails[employeeAttendanceDetailsIndex].punches.push({
                        type: "weekend",
                        punch_time: date,
                        note: "",
                    });
                    todayAttendance.attendanceDetails[employeeAttendanceDetailsIndex].present = 0;
                }

                await todayAttendance.save();

                // Update Employee model
                const attendanceData = {
                    date,
                    present: 0,
                    punches: [{
                        type: "weekend",
                        punch_time: date,
                        note: "",
                    }],
                };
                employee.attendances.push(attendanceData);
                await employee.save();
            }
        }
    } catch (error) {
        console.error("Error adding weekend punch:", error);
    }
};

module.exports = {
    punchIn,
    punchOut,
    addPunchForHoliday,
    addPunchWeekend
};