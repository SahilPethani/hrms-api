const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../middleware/errorhander");
const Employee = require("../models/employeeModel");
const Attendance = require("../models/attendanceModel");
const { calculateWorkingHours, calculateOvertime, calculateProductivity, calculateAverageInTime, calculateAverageOutTime, calculateAverageOvertime, calculateStatus } = require("../utils/helper");

// const punchIn = async (req, res, next) => {
//     try {
//         const employeeId = req.params.id;
//         const note = req.body.note;

//         let employee = await Employee.findById(employeeId);
//         if (!employee) {
//             return next(new ErrorHandler(`Employee not found with id ${employeeId}`, StatusCodes.NOT_FOUND));
//         }

//         // Create punch-in details
//         const punchInDetails = {
//             type: "punchIn",
//             punchIn: new Date(),
//             note: note,
//         };

//         let todayAttendance = await Attendance.findOne({
//             date: { $eq: new Date().setHours(0, 0, 0, 0) },
//             "attendanceDetails.employeeId": employee._id,
//         });

//         if (!todayAttendance) {
//             todayAttendance = new Attendance({
//                 date: new Date().setHours(0, 0, 0, 0),
//                 attendanceDetails: [{
//                     employeeId: employee._id,
//                     present: 1,
//                     punches: [punchInDetails],
//                 }],
//             });
//         } else {
//             todayAttendance.attendanceDetails.find(
//                 (detail) => detail.employeeId.equals(employee._id)
//             ).punches.push(punchInDetails);

//             todayAttendance.attendanceDetails.find(
//                 (detail) => detail.employeeId.equals(employee._id)
//             ).present = 1;
//         }

//         await todayAttendance.save();

//         const existingAttendanceIndex = employee.attendances.findIndex(
//             (attendance) => attendance.date.toISOString() === todayAttendance.date.toISOString()
//         );

//         if (existingAttendanceIndex !== -1) {
//             employee.attendances[existingAttendanceIndex].punches = todayAttendance.attendanceDetails[0].punches;
//         } else {
//             // Save the updated attendance record in the employee document
//             // employee.attendances.push(todayAttendance);
//             const attendanceData = {
//                 date: todayAttendance.date,
//                 present: todayAttendance.attendanceDetails[0].present,
//                 punches: todayAttendance.attendanceDetails[0].punches,
//             };
//             employee.attendances.push(attendanceData);
//         }

//         await employee.save();

//         return res.status(StatusCodes.OK).json({
//             status: StatusCodes.OK,
//             success: true,
//             message: `Employee punched in successfully`,
//         });
//     } catch (error) {
//         return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
//     }
// };

const punchIn = async (req, res, next) => {
    try {
        const employeeId = req.params.id;
        const note = req.body.note;

        let employee = await Employee.findById(employeeId);
        if (!employee) {
            return next(new ErrorHandler(`Employee not found with id ${employeeId}`, StatusCodes.NOT_FOUND));
        }

        const currentDate = new Date().setHours(0, 0, 0, 0);

        let todayAttendance = await Attendance.findOne({
            date: currentDate,
            "attendanceDetails.employeeId": employee._id,
        });

        if (!todayAttendance) {
            // If attendance record for the current date does not exist, create a new one
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
            punchIn: new Date(),
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

        const currentDate = new Date().setHours(0, 0, 0, 0);

        let todayAttendance = await Attendance.findOne({
            date: currentDate,
            "attendanceDetails.employeeId": employee._id,
        });

        if (!todayAttendance) {
            return next(new ErrorHandler(`Employee has not punched in today`, StatusCodes.BAD_REQUEST));
        }

        const punchOutDetails = {
            type: "punchOut",
            punchOut: new Date(),
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
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const getAttendanceDetails = async (req, res, next) => {
    try {
        const employeeId = req.params.id;

        let employee = await Employee.findById(employeeId);
        if (!employee) {
            return next(new ErrorHandler(`Employee not found with id ${employeeId}`, StatusCodes.NOT_FOUND));
        }

        // Get all attendance records for the employee
        const allAttendance = await Attendance.find({
            "attendanceDetails.employeeId": employee._id,
        });

        // Extract unique dates from all attendance records
        const uniqueDates = Array.from(new Set(allAttendance.map(record => record.date.toISOString().split('T')[0])));

        // Create an object to store attendance details for each date
        const monthlyAttendanceDetails = {};

        // Loop through unique dates
        uniqueDates.forEach(date => {
            const attendanceRecord = allAttendance.find(record => record.date.toISOString().split('T')[0] === date);

            if (attendanceRecord) {
                // Flatten the punches array for the date
                const punches = attendanceRecord.attendanceDetails.find(detail => detail.employeeId.equals(employeeId)).punches;

                // Sort punches by punchIn time
                punches.sort((a, b) => a.punchIn - b.punchIn);

                // Extract details for each attendance record
                const attendanceDetails = punches.map(punch => ({
                    checkInTime: punch.punchIn,
                    checkOutTime: punch.punchOut || null,
                    status: punch.punchOut ? 1 : 0,
                }));

                // If there's no punch in, add a record with zeros
                if (attendanceDetails.length === 0) {
                    attendanceDetails.push({
                        checkInTime: null,
                        checkOutTime: null,
                        status: 0,
                    });
                }

                // Set the date as the key in the object
                monthlyAttendanceDetails[date] = attendanceDetails;
            } else {
                // If there's no attendance record for the date, set zeros
                monthlyAttendanceDetails[date] = [{
                    checkInTime: null,
                    checkOutTime: null,
                    status: 0,
                }];
            }
        });

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Attendance details retrieved successfully`,
            data: {
                employee: {
                    firstName: employee.first_name,
                    lastName: employee.last_name,
                    userId: employee.user_id,
                    designation: employee.designation,
                    avatar: employee.avatar,
                    joiningDate: employee.join_date,
                },
                monthlyAttendanceDetails,
            },
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};



const getEmployeeAttendanceSummary = async (req, res, next) => {
    try {
        const requestedDate = req.query.date || new Date().toISOString().split('T')[0];
        const currentDate = new Date(requestedDate).setHours(0, 0, 0, 0);

        const presentEmployees = await Attendance.find({
            date: currentDate,
            "attendanceDetails.present": 1,
        }).populate('attendanceDetails.employeeId', 'first_name last_name user_id designation mobile avatar');

        const absentEmployees = await Employee.find({
            _id: {
                $nin: presentEmployees.flatMap(employeeAttendance => {
                    return employeeAttendance.attendanceDetails.map(detail => detail.employeeId._id);
                })
            },
        });

        const presentEmployeesData = presentEmployees.flatMap(employeeAttendance => {
            return employeeAttendance.attendanceDetails.map(detail => ({
                date: employeeAttendance.date,
                employee: {
                    _id: detail.employeeId._id,
                    firstName: detail.employeeId.first_name,
                    lastName: detail.employeeId.last_name,
                    userId: detail.employeeId.user_id,
                    mobile: detail.employeeId.mobile,
                    designation: detail.employeeId.designation,
                    avatar: detail.employeeId.avatar
                },
                present: true,
            }));
        });

        const absentEmployeesData = absentEmployees.map(employee => ({
            date: requestedDate,
            employee: {
                _id: employee._id,
                firstName: employee.first_name,
                lastName: employee.last_name,
                userId: employee.user_id,
                mobile: employee.mobile,
                designation: employee.designation,
                avatar: employee.avatar
            },
            present: false,
        }));

        const employeeAttendanceSummary = [...presentEmployeesData, ...absentEmployeesData];

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Employee attendance summary retrieved successfully`,
            data: {
                date: requestedDate,
                employeeAttendanceSummary,
            },
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};


const getAttendanceSheet = async (req, res, next) => {
    try {
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        let filter = {};

        if (startDate && endDate) {
            filter.date = {
                $gte: new Date(startDate + 'T00:00:00.000Z'),
                $lte: new Date(endDate + 'T23:59:59.999Z'),
            };
        } else {
            const currentDate = new Date();
            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

            filter.date = {
                $gte: firstDayOfMonth.setHours(0, 0, 0, 0),
                $lte: lastDayOfMonth.setHours(23, 59, 59, 999),
            };
        }
        const employeeAttendance = await Attendance.find(filter)
            .populate('attendanceDetails.employeeId', 'first_name last_name user_id avatar')
            .lean();

        const attendanceSheet = await Promise.all(employeeAttendance.map(async (item) => {
            const presentDetails = item.attendanceDetails.map(detail => ({
                employee: {
                    _id: detail.employeeId._id,
                    firstName: detail.employeeId.first_name,
                    lastName: detail.employeeId.last_name,
                    userId: detail.employeeId.user_id,
                    avatar: detail.employeeId.avatar,
                },
                present: detail.present === 1,
            }));

            const absentEmployees = await Employee.find({
                _id: {
                    $nin: presentDetails.filter(detail => detail.present).map(detail => detail.employee._id),
                },
            });

            const absentDetails = absentEmployees.map(employee => ({
                employee: {
                    _id: employee._id,
                    firstName: employee.first_name,
                    lastName: employee.last_name,
                    userId: employee.user_id,
                    avatar: employee.avatar,
                },
                present: false,
            }));

            const summary = {
                present: presentDetails.filter(detail => detail.present).length,
                absent: absentDetails.length,
            };

            return {
                date: item.date,
                summary,
                attendanceDetails: [...presentDetails, ...absentDetails],
            };
        }));

        const filteredAttendanceSheet = attendanceSheet.filter(item => item !== null);

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Attendance sheet retrieved successfully`,
            data: {
                attendanceSheet: filteredAttendanceSheet,
            },
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};


module.exports = {
    punchIn,
    punchOut,
    getAttendanceDetails,
    getEmployeeAttendanceSummary,
    getAttendanceSheet
};