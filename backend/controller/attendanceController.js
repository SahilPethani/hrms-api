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
        const requestedDate = req.query.date || new Date(requestedDate).setHours(0, 0, 0, 0);

        let employee = await Employee.findById(employeeId);
        if (!employee) {
            return next(new ErrorHandler(`Employee not found with id ${employeeId}`, StatusCodes.NOT_FOUND));
        }
        const currentDate = new Date(requestedDate).setHours(0, 0, 0, 0);

        let todayAttendance = await Attendance.findOne({
            date: currentDate,
            "attendanceDetails.employeeId": employee._id,
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

        const punches = employeeAttendanceDetails.punches;

        const workingHours = calculateWorkingHours(punches);
        const overtime = calculateOvertime(workingHours);
        const productivity = calculateProductivity(workingHours);

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
                date: employeeAttendanceDetails.date,
                present: employeeAttendanceDetails.present,
                employee: {
                    firstName: employee.first_name,
                    lastName: employee.last_name,
                    userId: employee.user_id,
                    designation: employee.designation,
                },
                workingHours,
                overtime,
                productivity,
                attendanceDetails: employeeAttendanceDetails.punches || [],
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
        }).populate('attendanceDetails.employeeId', 'first_name last_name user_id designation mobile');
        
        // const absentEmployees = await Employee.find({
        //     _id: { $nin: presentEmployees.map(employee => employee.attendanceDetails[0].employeeId) },
        // });

        const absentEmployees = await Employee.find({
            _id: {
                $nin: presentEmployees.flatMap(employeeAttendance => {
                    return employeeAttendance.attendanceDetails.map(detail => detail.employeeId._id);
                })
            },
        });
    
        // const presentEmployeesData = presentEmployees.map(employeeAttendance => ({
        //     date: employeeAttendance.date,
        //     employee: {
        //         _id: employeeAttendance.attendanceDetails[0].employeeId._id,
        //         firstName: employeeAttendance.attendanceDetails[0].employeeId.first_name,
        //         lastName: employeeAttendance.attendanceDetails[0].employeeId.last_name,
        //         userId: employeeAttendance.attendanceDetails[0].employeeId.user_id,
        //         mobile: employeeAttendance.attendanceDetails[0].employeeId.mobile,
        //         designation: employeeAttendance.attendanceDetails[0].employeeId.designation,
        //     },
        //     present: true,
        //     // punches: employeeAttendance.attendanceDetails[0].punches,
        // }));

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
            },
            present: false,
            // punches: [],
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

module.exports = {
    punchIn,
    punchOut,
    getAttendanceDetails,
    getEmployeeAttendanceSummary,
};