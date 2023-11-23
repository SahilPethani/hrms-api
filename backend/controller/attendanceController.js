const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../middleware/errorhander");
const Employee = require("../models/employeeModel");
const Attendance = require("../models/attendanceModel");
const { calculateWorkingHours, calculateOvertime, calculateProductivity } = require("../utils/helper");

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
            todayAttendance.attendanceDetails[employeeAttendanceDetailsIndex].present = 0;
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
        console.log("🚀 ~ file: attendanceController.js:226 ~ getAttendanceDetails ~ employeeId:", employeeId)
        const requestedDate = req.query.date || new Date().toISOString().split('T')[0];
        console.log("🚀 ~ file: attendanceController.js:227 ~ getAttendanceDetails ~ requestedDate:", requestedDate)

        const todayAttendance = await Attendance.findOne({
            date: requestedDate,
            "attendanceDetails.employeeId": employeeId,
        });

        if (!todayAttendance) {
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                success: true,
                message: `No attendance details found for the specified date`,
                data: {
                    attendanceDetails: [],
                },
            });
        }

        const employeeAttendanceDetails = todayAttendance.attendanceDetails.find(
            (detail) => detail.employeeId.equals(employeeId)
        );

        if (!employeeAttendanceDetails) {
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                success: true,
                message: `No attendance details found for the specified employee on the given date`,
                data: {
                    attendanceDetails: [],
                },
            });
        }

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Attendance details retrieved successfully`,
            data: {
                attendanceDetails: employeeAttendanceDetails.punches || [],
            },
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};


module.exports = {
    punchIn,
    punchOut,
    getAttendanceDetails
};
