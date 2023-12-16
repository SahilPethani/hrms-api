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

        const isHoliday = await Holiday.exists({ holiday_date: new Date(currentDate) });

        if (isHoliday) {
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                success: false,
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
                            type_attendance: "present",
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
            todayAttendance.attendanceDetails[employeeAttendanceDetailsIndex].type_attendance = "present";
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
                type_attendance: todayAttendance.attendanceDetails[employeeAttendanceDetailsIndex].type_attendance,
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
            return next(new ErrorHandler(`Employee has not punched-in today`, StatusCodes.BAD_REQUEST));
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

const breakIn = async (req, res, next) => {
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
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                success: false,
                message: `Employee hasn't punched in yet. Cannot perform break-in.`,
            });
        }

        const employeeAttendanceDetailsIndex = todayAttendance.attendanceDetails.findIndex(
            (detail) => detail.employeeId.equals(employee._id)
        );

        if (employeeAttendanceDetailsIndex === -1 || !todayAttendance.attendanceDetails[employeeAttendanceDetailsIndex].punches.some(punch => punch.type === "punchIn")) {
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                success: false,
                message: `Employee hasn't punched in yet. Cannot perform break-in.`,
            });
        }

        const punchInDetails = {
            type: "breakIn",
            punch_time: new Date(),
            note: note,
        };

        const punchOutDetails = {
            type: "breakOut",
            punch_time: new Date(),
            note: note,
        };

        todayAttendance.attendanceDetails[employeeAttendanceDetailsIndex].punches.push(punchInDetails);

        await todayAttendance.save();

        // Add break-in details to the Employee model's attendances array
        const existingAttendanceIndex = employee.attendances.findIndex(
            (attendance) => attendance.date.toISOString() === todayAttendance.date.toISOString()
        );

        if (existingAttendanceIndex !== -1) {
            employee.attendances[existingAttendanceIndex].punches = todayAttendance.attendanceDetails[employeeAttendanceDetailsIndex].punches;
        } else {
            const attendanceData = {
                punches: todayAttendance.attendanceDetails[employeeAttendanceDetailsIndex].punches,
            };
            employee.attendances.push(attendanceData);
        }

        await employee.save();

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Employee performed a break-in successfully`,
            date: currentDateIST
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};



const breakOut = async (req, res, next) => {
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

        const breakInIndex = todayAttendance.attendanceDetails.findIndex(
            (detail) => detail.employeeId.equals(employee._id) && detail.type_attendance === "breakIn"
        );

        if (breakInIndex === -1) {
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                success: false,
                message: `Cannot perform break-out. Employee has not taken a break today.`,
            });
        }

        const punchOutDetails = {
            type: "breakOut",
            punch_time: new Date(),
            note: note,
        };

        todayAttendance.attendanceDetails[breakInIndex].punches.push(punchOutDetails);
        await todayAttendance.save();

        // Update the Employee model's attendances array
        const attendanceData = {
            punches: todayAttendance.attendanceDetails[breakInIndex].punches,
        };

        const existingAttendanceIndex = employee.attendances.findIndex(
            (attendance) => attendance.date.toISOString() === todayAttendance.date.toISOString()
        );

        if (existingAttendanceIndex !== -1) {
            employee.attendances[existingAttendanceIndex] = attendanceData;
        } else {
            employee.attendances.push(attendanceData);
        }

        await employee.save();

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Employee broke out successfully`,
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
                                type_attendance: "holiday",
                            },
                        },
                    },
                    { upsert: true, new: true }
                );

                // Update Employee model
                const attendanceData = {
                    date,
                    present: 0,
                    type_attendance: "holiday",
                };
                employee.attendances.push(attendanceData);
                await employee.save();

            } else {
                const employeeAttendanceDetailsIndex = todayAttendance.attendanceDetails.findIndex(
                    (detail) => detail.employeeId.equals(employee._id)
                );
                if (employeeAttendanceDetailsIndex !== -1) {
                    todayAttendance.attendanceDetails[employeeAttendanceDetailsIndex].present = 0;
                    todayAttendance.attendanceDetails[employeeAttendanceDetailsIndex].type_attendance = "holiday";
                    todayAttendance.attendanceDetails[employeeAttendanceDetailsIndex].date = date;
                }

                await todayAttendance.save();

                // Update Employee model
                const attendanceData = {
                    date,
                    type_attendance: "holiday",
                    present: 0,
                };
                employee.attendances.push(attendanceData);
                await employee.save();
            }
        }
    } catch (error) {
        console.error("Error adding holiday punch:", error);
    }
};

const addLeaveAttendance = async (employeeId, fromDate, toDate, type, one_day_leave_type) => {
    try {
        const employee = await Employee.findById(employeeId);

        if (!employee) {
            throw new Error('Employee not found');
        }

        // Add logic to add attendance for each day within the leave period
        const currentDate = new Date(fromDate);
        const endDate = new Date(toDate);

        while (currentDate <= endDate) {

            const todayAttendance = await Attendance.findOne({
                date: currentDate,
                "attendanceDetails.employeeId": employee._id,
            });

            const newAttendance = {
                date: new Date(currentDate),
                present: 0,
                type_attendance: "leave",
                type_leave: type === "One Day" ? one_day_leave_type : type,
            };
            employee.attendances.push(newAttendance);

            if (!todayAttendance) {
                await Attendance.findOneAndUpdate(
                    { date: currentDate },
                    {
                        $addToSet: {
                            attendanceDetails: {
                                employeeId: employee._id,
                                present: 0,
                                type_attendance: "leave",
                                type_leave: type === "One Day" ? one_day_leave_type : type,
                                date: currentDate,
                            },
                        },
                    },
                    { upsert: true, new: true }
                );

                // const existingAttendanceIndex = employee.attendances.findIndex(attendance =>
                //     new Date(attendance.date).toDateString() === currentDate.toDateString()
                // );

                // if (existingAttendanceIndex !== -1) {
                //     employee.attendances[existingAttendanceIndex].present = 0;
                // } else {

                // }
            } else {
                todayAttendance.attendanceDetails.forEach(detail => {
                    if (detail.employeeId.equals(employee._id) && detail.type_attendance === "leave") {
                        detail.present = 0;
                        detail.type_leave = type === "One Day" ? one_day_leave_type : type;
                    }
                });
                await todayAttendance.save();

                // Update Employee model
                // const existingAttendanceIndex = employee.attendances.findIndex(attendance =>
                //     new Date(attendance.date).toDateString() === currentDate.toDateString()
                // );

                // if (existingAttendanceIndex !== -1) {
                //     employee.attendances[existingAttendanceIndex].present = 0;
                // } else {
                //     const newAttendance = {
                //         date: currentDate,
                //         present: 0,
                //         type_attendance: "leave",
                //     };
                //     employee.attendances.push(newAttendance);
                // }
            }

            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Save the updated employee document
        await employee.save();
    } catch (error) {
        throw new Error(`Error adding leave attendance: ${error.message}`);
    }
};

module.exports = {
    punchIn,
    punchOut,
    addPunchForHoliday,
    addLeaveAttendance,
    breakIn,
    breakOut,
};