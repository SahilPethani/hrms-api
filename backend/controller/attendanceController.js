const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../middleware/errorhander");
const Employee = require("../models/employeeModel");
const Attendance = require("../models/attendanceModel");

const punchIn = async (req, res, next) => {
    try {
        const employeeId = req.params.id;
        const note = req.body.note;

        let employee = await Employee.findById(employeeId);
        if (!employee) {
            return next(new ErrorHandler(`Employee not found with id ${employeeId}`, StatusCodes.NOT_FOUND));
        }

        // Create punch-in details
        const punchInDetails = {
            type: "punchIn",
            punchIn: new Date(),
            note: note,
        };

        let todayAttendance = await Attendance.findOne({
            date: { $eq: new Date().setHours(0, 0, 0, 0) },
            "attendanceDetails.employeeId": employee._id,
        });

        if (!todayAttendance) {
            todayAttendance = new Attendance({
                date: new Date().setHours(0, 0, 0, 0),
                attendanceDetails: [{
                    employeeId: employee._id,
                    present: 1,
                    punches: [punchInDetails],
                }],
            });
        } else {
            todayAttendance.attendanceDetails.find(
                (detail) => detail.employeeId.equals(employee._id)
            ).punches.push(punchInDetails);

            todayAttendance.attendanceDetails.find(
                (detail) => detail.employeeId.equals(employee._id)
            ).present = 1;
        }

        await todayAttendance.save();

        const existingAttendanceIndex = employee.attendances.findIndex(
            (attendance) => attendance.date.toISOString() === todayAttendance.date.toISOString()
        );

        if (existingAttendanceIndex !== -1) {
            employee.attendances[existingAttendanceIndex].punches = todayAttendance.attendanceDetails[0].punches;
        } else {
            // Save the updated attendance record in the employee document
            // employee.attendances.push(todayAttendance);
            const attendanceData = {
                date: todayAttendance.date,
                present: todayAttendance.attendanceDetails[0].present,
                punches: todayAttendance.attendanceDetails[0].punches,
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
//             // If no attendance record for today, create a new one
//             todayAttendance = new Attendance({
//                 date: new Date().setHours(0, 0, 0, 0),
//                 attendanceDetails: [{
//                     employeeId: employee._id,
//                     present: 1,
//                     punches: [punchInDetails],
//                 }],
//             });
//             // Save new attendance record
//             await todayAttendance.save();
//         } else {
//             // If attendance record for today exists, find the corresponding employee details
//             const employeeDetails = todayAttendance.attendanceDetails.find(
//                 (detail) => detail.employeeId.equals(employee._id)
//             );

//             if (!employeeDetails) {
//                 // If employee details don't exist for today, create new details
//                 todayAttendance.attendanceDetails.push({
//                     employeeId: employee._id,
//                     present: 1,
//                     punches: [punchInDetails],
//                 });
//             } else {
//                 // If employee details exist, add punch-in details
//                 employeeDetails.punches.push(punchInDetails);
//                 employeeDetails.present = 1;
//             }

//             // Save updated attendance record
//             await todayAttendance.save();
//         }

//         // Update attendance record in the employee
//         const existingAttendanceIndex = employee.attendances.findIndex(
//             (attendance) => attendance.date.toISOString() === todayAttendance.date.toISOString()
//         );

//         if (existingAttendanceIndex !== -1) {
//             employee.attendances[existingAttendanceIndex].punches = todayAttendance.attendanceDetails
//                 .find((detail) => detail.employeeId.equals(employee._id)).punches;
//         } else {
//             // Add new attendance record to the employee
//             const attendanceData = {
//                 date: todayAttendance.date,
//                 present: todayAttendance.attendanceDetails
//                     .find((detail) => detail.employeeId.equals(employee._id)).present,
//                 punches: todayAttendance.attendanceDetails
//                     .find((detail) => detail.employeeId.equals(employee._id)).punches,
//             };
//             employee.attendances.push(attendanceData);
//         }

//         // Save the updated employee
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


const punchOut = async (req, res, next) => {
    try {
        const employeeId = req.params.id;
        const note = req.body.note;

        let employee = await Employee.findById(employeeId);
        if (!employee) {
            return next(new ErrorHandler(`Employee not found with id ${employeeId}`, StatusCodes.NOT_FOUND));
        }

        let todayAttendance = await Attendance.findOne({
            date: { $eq: new Date().setHours(0, 0, 0, 0) },
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

        todayAttendance.attendanceDetails.find(
            (detail) => detail.employeeId.equals(employee._id)
        ).punches.push(punchOutDetails);

        todayAttendance.attendanceDetails.find(
            (detail) => detail.employeeId.equals(employee._id)
        ).present = 1;

        await todayAttendance.save();

        const existingAttendanceIndex = employee.attendances.findIndex(
            (attendance) => attendance.date.toISOString() === todayAttendance.date.toISOString()
        );

        if (existingAttendanceIndex !== -1) {
            employee.attendances[existingAttendanceIndex].punches = todayAttendance.attendanceDetails[0].punches;
        } else {
            employee.attendances.push(todayAttendance);
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

module.exports = {
    punchIn,
    punchOut
};
