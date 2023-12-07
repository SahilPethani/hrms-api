const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../middleware/errorhander");
const Employee = require("../models/employeeModel");
const Attendance = require("../models/attendanceModel");
const { getDayName, formatTotalWorkingHours } = require("../utils/helper");
const Holiday = require("../models/holidayModel");
const moment = require('moment');

// const getAttendanceDetails = async (req, res, next) => {
//     try {
//         const employeeId = req.params.id;

//         let employee = await Employee.findById(employeeId);
//         if (!employee) {
//             return next(new ErrorHandler(`Employee not found with id ${employeeId}`, StatusCodes.NOT_FOUND));
//         }

//         const monthlyAttendanceDetails = [];
//         employee.attendances.forEach(attendanceRecord => {
//             const date = attendanceRecord.date.toISOString().split('T')[0];
//             const punches = attendanceRecord.punches;

//             const attendanceDetail = {
//                 date,
//                 checkInTime: '00:00',
//                 checkOutTime: '00:00',
//                 totalWorkingHours: '00:00',
//                 present: false,
//                 overtime: '00:00'
//             };

//             if (punches.length > 0) {
//                 const firstPunch = new Date(punches[0]?.punch_time);
//                 const punchOuts = punches.filter(punch => punch?.type === 'punchOut');
//                 const lastPunchOut = punchOuts?.length > 0 ? punchOuts[punchOuts?.length - 1]?.punch_time : "00:00";
//                 const lastPunchTime = lastPunchOut !== "00:00" ? new Date(lastPunchOut) : "00:00";
//                 const lastPunchType = punches[punches.length - 1].type;
//                 const excludeLastPunchInTime = lastPunchType === 'punchIn';

//                 attendanceDetail.checkOutTime = lastPunchTime && !excludeLastPunchInTime
//                     ? lastPunchTime !== "00:00" ? lastPunchTime.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) : "00:00"
//                     : '00:00';
//                 attendanceDetail.checkInTime = firstPunch ? firstPunch.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' }) : "00:00"

//                 if (!excludeLastPunchInTime) {
//                     if (lastPunchTime !== "00:00") {
//                         const totalHours = (lastPunchTime - firstPunch) / (1000 * 60 * 60);
//                         attendanceDetail.totalWorkingHours = formatTotalWorkingHours(totalHours);
//                     }

//                     const overtimeStartTime = new Date(attendanceRecord.date).setHours(18, 30, 0, 0); // 6:30 PM
//                     const lastPunchOut = lastPunchTime !== "00:00" ? lastPunchTime.getTime() : "00:00"

//                     if (lastPunchOut !== "00:00") {
//                         if (lastPunchOut > overtimeStartTime) {
//                             const overtimeMinutes = (lastPunchOut - overtimeStartTime) / (1000 * 60);
//                             attendanceDetail.overtime = formatTotalWorkingHours(overtimeMinutes / 60); // Convert minutes to hours
//                         }
//                     }
//                 }

//                 // if (punches.length > 0) {
//                 //     const breakStartTime = new Date(attendanceRecord.date).setHours(12, 45, 0, 0); // 12:45 PM
//                 //     const breakEndTime = new Date(attendanceRecord.date).setHours(13, 50, 0, 0); // 1:45 PM
//                 //     const breakPunchOuts = punches.filter(
//                 //         punch => punch.type === 'punchOut' && punch.punch_time >= breakStartTime && punch.punch_time <= breakEndTime
//                 //     );
//                 //     if (breakPunchOuts.length > 0) {
//                 //         const breakPunchIn = punches.find(
//                 //             punch => punch.type === 'punchIn' && punch.punch_time >= breakStartTime && punch.punch_time <= breakEndTime
//                 //         );

//                 //         if (breakPunchIn) {
//                 //             attendanceDetail.breakTime = (breakPunchOuts[0].punch_time - breakPunchIn.punch_time) / (1000 * 60 * 60);
//                 //         }
//                 //     }
//                 // }

//                 attendanceDetail.present = punches.some(punch => punch.type === 'punchIn' ? true : false);
//             }
//             monthlyAttendanceDetails.push(attendanceDetail);
//         });

//         const totalWorkingHours = monthlyAttendanceDetails.reduce((sum, attendance) => sum + parseFloat(attendance.totalWorkingHours), 0);
//         const totalCheckInTime = monthlyAttendanceDetails.reduce((sum, attendance) => sum + (attendance.checkInTime ? new Date(`2000-01-01 ${attendance.checkInTime}`).getTime() : 0), 0);
//         const totalCheckOutTime = monthlyAttendanceDetails.reduce((sum, attendance) => sum + (attendance.checkOutTime ? new Date(`2000-01-01 ${attendance.checkOutTime}`).getTime() : 0), 0);

//         const averageWorkingHours = (totalWorkingHours / monthlyAttendanceDetails.length).toFixed(2);
//         const averageInTime = new Date(totalCheckInTime / monthlyAttendanceDetails.length).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' });
//         const averageOutTime = totalCheckOutTime ? new Date(totalCheckOutTime / monthlyAttendanceDetails.length).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' }) : "00:00"

//         return res.status(StatusCodes.OK).json({
//             status: StatusCodes.OK,
//             success: true,
//             message: `Attendance details retrieved successfully`,
//             data: {
//                 employee: {
//                     _id: employee._id,
//                     firstName: employee.first_name,
//                     lastName: employee.last_name,
//                     userId: employee.user_id,
//                     avatar: employee.avatar,
//                     designation: employee.designation,
//                     joiningDate: employee.join_date,
//                 },
//                 averageWorkingHours,
//                 averageInTime,
//                 averageOutTime,
//                 attendessdetail: monthlyAttendanceDetails,
//             },
//         });
//     } catch (error) {
//         return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
//     }
// };


// Add this function at the beginning of your code

const getAttendanceDetails = async (req, res, next) => {
    try {
        const employeeId = req.params.id;

        let employee = await Employee.findById(employeeId);
        if (!employee) {
            return next(new ErrorHandler(`Employee not found with id ${employeeId}`, StatusCodes.NOT_FOUND));
        }

        const monthlyAttendanceDetails = [];
        let totalAbsentDays = 0;
        let totalPresentDays = 0;
        let totalHolidayDays = 0;

        employee.attendances.forEach(attendanceRecord => {
            const date = attendanceRecord.date.toISOString().split('T')[0];
            const punches = attendanceRecord.punches;

            const attendanceDetail = {
                date,
                checkInTime: '00:00',
                checkOutTime: '00:00',
                totalWorkingHours: '00:00',
                type: '',
                present: false,
                overtime: '00:00'
            };

            if (punches.length > 0) {
                const firstPunch = new Date(punches[0]?.punch_time);
                const lastPunchOut = punches
                    .filter(punch => punch?.type === 'punchOut')
                    .map(punch => new Date(punch?.punch_time))
                    .pop() || new Date("00:00");

                attendanceDetail.checkOutTime = lastPunchOut !== "00:00"
                    ? (lastPunchOut instanceof Date && !isNaN(lastPunchOut.getTime())
                        ? lastPunchOut.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' })
                        : '00:00'
                    )
                    : '00:00';

                attendanceDetail.checkInTime = firstPunch ? firstPunch.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' }) : '00:00';

                if (lastPunchOut !== "00:00") {
                    const totalHours = (lastPunchOut - firstPunch) / (1000 * 60 * 60);

                    if (!isNaN(totalHours) && isFinite(totalHours)) {
                        attendanceDetail.totalWorkingHours = formatTotalWorkingHours(totalHours);
                    } else {
                        attendanceDetail.totalWorkingHours = '00:00';
                    }
                }

                const overtimeStartTime = new Date(attendanceRecord.date).setHours(18, 30, 0, 0); // 6:30 PM
                const lastPunchOutTime = lastPunchOut.getTime();

                if (lastPunchOutTime > overtimeStartTime) {
                    const overtimeMinutes = (lastPunchOutTime - overtimeStartTime) / (1000 * 60);
                    attendanceDetail.overtime = formatTotalWorkingHours(overtimeMinutes / 60); // Convert minutes to hours
                }

                if (punches.some(punch => punch.type === 'holiday')) {
                    attendanceDetail.present = false;
                    attendanceDetail.type = "holiday"
                    totalHolidayDays++;
                } else {
                    attendanceDetail.present = true; 
                    attendanceDetail.type = "present"

                }
            }
            if (!attendanceDetail.present) {
                totalAbsentDays++;
            } else {
                totalPresentDays++;
            }

            monthlyAttendanceDetails.push(attendanceDetail);
        });

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Attendance details retrieved successfully`,
            data: {
                employee: {
                    _id: employee._id,
                    firstName: employee.first_name,
                    lastName: employee.last_name,
                    userId: employee.user_id,
                    avatar: employee.avatar,
                    designation: employee.designation,
                    joiningDate: employee.join_date,
                },
                totalAbsentDays,
                totalPresentDays,
                totalHolidayDays,
                attendessdetail: monthlyAttendanceDetails,
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

// const getAttendanceSheet = async (req, res, next) => {
//     try {
//         const monthNameParam = req.query.monthName;

//         if (!monthNameParam) {
//             return res.status(StatusCodes.BAD_REQUEST).json({
//                 status: StatusCodes.BAD_REQUEST,
//                 success: false,
//                 message: "Month name is required",
//             });
//         }

//         const currentDate = new Date();

//         // Convert month name to a number (0-indexed, where January is 0)
//         const monthIndex = new Date(`${monthNameParam} 1, ${currentDate.getFullYear()}`).getMonth();

//         if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
//             return res.status(StatusCodes.BAD_REQUEST).json({
//                 status: StatusCodes.BAD_REQUEST,
//                 success: false,
//                 message: "Invalid month name",
//             });
//         }

//         const firstDayOfMonth = new Date(currentDate.getFullYear(), monthIndex, 1);
//         const lastDayOfMonth = new Date(currentDate.getFullYear(), monthIndex + 1, 0);

//         const startDate = firstDayOfMonth.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
//         const endDate = lastDayOfMonth.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });

//         const filter = {
//             attendances: {
//                 $elemMatch: {
//                     date: {
//                         $gte: new Date(startDate),
//                         $lte: new Date(endDate),
//                     },
//                 },
//             },
//         };

//         const Holidays = await Holiday.find();
//         const employees = await Employee.find(filter).lean();

//         const attendanceSheet = employees.map(employee => {
//             const attendanceDetails = Array.from({ length: lastDayOfMonth.getDate() }, (_, day) => {
//                 const currentDateInLoop = new Date(
//                     lastDayOfMonth.getFullYear(),
//                     lastDayOfMonth.getMonth(),
//                     day + 1
//                 );
//                 const isSunday = currentDateInLoop.getDay() === 0;

//                 // Check for attendance on the specific day
//                 const attendanceData = employee.attendances.find(attendance =>
//                     new Date(attendance.date).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) === currentDateInLoop.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
//                 );

//                 const isHoliday = Holidays.find((date) => {
//                     const holidayDateUTC = new Date(date.holiday_date);
//                     const holidayDateLocal = holidayDateUTC.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
//                     const currentDateInLoopLocal = currentDateInLoop.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
//                     return holidayDateLocal === currentDateInLoopLocal;
//                 });

//                 // Check if the employee has attendance on this specific day
//                 const isPresent = attendanceData ? attendanceData.present === 1 : false;
//                 const isAbsent = isSunday ? false : !isPresent;

//                 return {
//                     date: currentDateInLoop.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
//                     dayName: getDayName(currentDateInLoop.getDay()),
//                     present: isPresent,
//                     absent: isAbsent,
//                     holiday: isHoliday ? true : isSunday,
//                 };
//             });

//             return {
//                 employee: {
//                     _id: employee._id,
//                     firstName: employee.first_name,
//                     lastName: employee.last_name,
//                     userId: employee.user_id,
//                     avatar: employee.avatar,
//                 },
//                 attendanceDetails,
//             };
//         });

//         return res.status(StatusCodes.OK).json({
//             status: StatusCodes.OK,
//             success: true,
//             message: "Attendance sheet retrieved successfully",
//             data: attendanceSheet,
//         });
//     } catch (error) {
//         return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
//     }
// };

const getAttendanceSheet = async (req, res, next) => {
    try {
        const monthNameParam = req.query.monthName;

        if (!monthNameParam) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusCodes.BAD_REQUEST,
                success: false,
                message: "Month name is required",
            });
        }

        const currentDate = new Date();

        // Convert month name to a number (0-indexed, where January is 0)
        const monthIndex = new Date(`${monthNameParam} 1, ${currentDate.getFullYear()}`).getMonth();

        if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusCodes.BAD_REQUEST,
                success: false,
                message: "Invalid month name",
            });
        }

        const firstDayOfMonth = new Date(currentDate.getFullYear(), monthIndex, 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), monthIndex + 1, 0);

        const startDate = firstDayOfMonth.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
        const endDate = lastDayOfMonth.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });

        const filter = {
            attendances: {
                $elemMatch: {
                    date: {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate),
                    },
                },
            },
        };

        const Holidays = await Holiday.find();
        const employees = await Employee.find(filter).lean();

        const attendanceSheet = employees.map(employee => {
            const attendanceDetails = Array.from({ length: lastDayOfMonth.getDate() }, (_, day) => {
                const currentDateInLoop = new Date(
                    lastDayOfMonth.getFullYear(),
                    lastDayOfMonth.getMonth(),
                    day + 1
                );
                const isSunday = currentDateInLoop.getDay() === 0;

                // Check if the current date is a holiday
                const isHoliday = Holidays.find((date) => {
                    const holidayDateUTC = new Date(date.holiday_date);
                    const holidayDateLocal = holidayDateUTC.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
                    const currentDateInLoopLocal = currentDateInLoop.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
                    return holidayDateLocal === currentDateInLoopLocal;
                });

                // Skip the date if it's a holiday
                if (isHoliday) {
                    return null;
                }

                // Check for attendance on the specific day
                const attendanceData = employee.attendances.find(attendance =>
                    new Date(attendance.date).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) === currentDateInLoop.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' })
                );

                // Check if the employee has attendance on this specific day
                const isPresent = attendanceData ? attendanceData.present === 1 : false;
                const isAbsent = isSunday ? false : !isPresent;

                return {
                    date: currentDateInLoop.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }),
                    dayName: getDayName(currentDateInLoop.getDay()),
                    present: isPresent,
                    absent: isAbsent,
                    holiday: isSunday || isHoliday, // Consider Sundays and holidays as holidays
                };
            }).filter(detail => detail !== null);

            return {
                employee: {
                    _id: employee._id,
                    firstName: employee.first_name,
                    lastName: employee.last_name,
                    userId: employee.user_id,
                    avatar: employee.avatar,
                },
                attendanceDetails,
            };
        });

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: "Attendance sheet retrieved successfully",
            data: attendanceSheet,
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};



const getTodayAttendance = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page_no) || 1;
        const perPage = parseInt(req.query.items_per_page) || 10;
        const search_text = req.query.search_text || '';

        const currentDateIST = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const currentDate = new Date(currentDateIST).setHours(0, 0, 0, 0);

        const skip = (page - 1) * perPage;

        let query = {};
        if (search_text) {
            query.$or = [
                { first_name: { $regex: new RegExp(search_text, 'i') } },
                { last_name: { $regex: new RegExp(search_text, 'i') } }
            ];
        }

        const employees = await Employee.find(query)
            .skip(skip)
            .limit(perPage);

        const todayAttendance = [];

        for (const employee of employees) {
            const employeeAttendance = {
                _id: employee._id,
                firstName: employee.first_name,
                lastName: employee.last_name,
                userId: employee.user_id,
                avatar: employee.avatar,
                designation: employee.designation,
                checkInTime: '00:00',
                checkOutTime: '00:00',
                totalWorkingHours: 0,
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
                    const firstPunch = new Date(employeeDetails.punches[0]?.punch_time);
                    const punchOuts = employeeDetails.punches.filter(punch => punch.type === 'punchOut');
                    const lastPunchOut = punchOuts.length > 0 ? punchOuts[punchOuts.length - 1].punch_time : null;
                    const lastPunchTime = lastPunchOut ? new Date(lastPunchOut) : null;
                    const lastPunchType = employeeDetails.punches[employeeDetails.punches.length - 1].type;
                    const excludeLastPunchInTime = lastPunchType === 'punchIn';

                    employeeAttendance.checkOutTime = lastPunchTime && !excludeLastPunchInTime
                        ? lastPunchTime.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' })
                        : '00:00';
                    employeeAttendance.checkInTime = firstPunch.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' });

                    if (!excludeLastPunchInTime) {
                        const totalHours = (lastPunchTime - firstPunch) / (1000 * 60 * 60);
                        employeeAttendance.totalWorkingHours = formatTotalWorkingHours(totalHours);
                    }

                    // // Calculate break time
                    // if (employeeDetails.punches.length > 0) {
                    //     const breakStartTime = new Date(currentDate).setHours(12, 45, 0, 0); // 12:45 PM
                    //     const breakEndTime = new Date(currentDate).setHours(13, 50, 0, 0); // 1:45 PM
                    //     const breakPunchOuts = employeeDetails.punches.filter(
                    //         punch => punch.type === 'punchOut' && punch.punch_time >= breakStartTime && punch.punch_time <= breakEndTime
                    //     );
                    //     if (breakPunchOuts.length > 0) {
                    //         const breakPunchIn = employeeDetails.punches.find(
                    //             punch => punch.type === 'punchIn' && punch.punch_time >= breakStartTime && punch.punch_time <= breakEndTime
                    //         );

                    //         if (breakPunchIn) {
                    //             employeeAttendance.breakTime = (breakPunchOuts[0].punch_time - breakPunchIn.punch_time) / (1000 * 60 * 60);
                    //         }
                    //     }
                    // }
                    employeeAttendance.present = true;
                }
            }

            todayAttendance.push(employeeAttendance);
        }
        const totalEmployees = await Employee.countDocuments();
        const totalPages = Math.ceil(totalEmployees / perPage);
        const pagination = {
            total_items: totalEmployees,
            total_pages: totalPages,
            current_page_item: todayAttendance.length,
            page_no: parseInt(page),
            items_per_page: parseInt(perPage),
        };

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Today's attendance details retrieved successfully`,
            data: todayAttendance,
            pagination: pagination,
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const getEmployeePunchesToday = async (req, res, next) => {
    try {
        const employeeId = req.params.id;
        const currentDateIST = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const currentDate = new Date(currentDateIST).setHours(0, 0, 0, 0);

        let employee = await Employee.findById(employeeId);
        if (!employee) {
            return next(new ErrorHandler(`Employee not found with id ${employeeId}`, StatusCodes.NOT_FOUND));
        }
        const FindAttendes = employee.attendances.find((items, index) => new Date(items.date).setHours(0, 0, 0, 0) === currentDate)

        if (!FindAttendes) {
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                success: true,
                message: "No punches found for the employee today",
                data: {
                    employeeId,
                    punches: [],
                },
            });
        }

        let checkInTime = '00:00';
        let totalWorkingHours = 0;
        let overtime = '00:00';

        if (FindAttendes) {
            if (FindAttendes.punches.length > 0) {
                const firstPunch = new Date(FindAttendes.punches[0]?.punch_time);
                const punchOuts = FindAttendes.punches.filter(punch => punch.type === 'punchOut');
                const lastPunchOut = punchOuts.length > 0 ? punchOuts[punchOuts.length - 1].punch_time : null;
                const lastPunchTime = lastPunchOut ? new Date(lastPunchOut) : null;
                const lastPunchType = FindAttendes.punches[FindAttendes.punches.length - 1].type;
                const excludeLastPunchInTime = lastPunchType === 'punchIn';

                checkOutTime = lastPunchTime && !excludeLastPunchInTime
                    ? lastPunchTime.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' })
                    : '00:00';
                checkInTime = firstPunch.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' });

                // Calculate total working hours
                if (lastPunchTime) {
                    const totalHours = (lastPunchTime - firstPunch) / (1000 * 60 * 60);
                    totalWorkingHours = formatTotalWorkingHours(totalHours);
                    const overtimeStartTime = new Date(currentDate).setHours(18, 30, 0, 0); // 6:30 PM
                    const lastPunchOut = lastPunchTime.getTime();
                    if (lastPunchOut > overtimeStartTime) {
                        const overtimeMinutes = (lastPunchOut - overtimeStartTime) / (1000 * 60);
                        overtime = formatTotalWorkingHours(overtimeMinutes / 60); // Convert minutes to hours
                    }
                }

                // // Calculate break time
                // if (FindAttendes.punches.length > 0) {
                //     const breakStartTime = new Date(currentDate).setHours(12, 45, 0, 0); // 12:45 PM
                //     const breakEndTime = new Date(currentDate).setHours(13, 50, 0, 0); // 1:45 PM
                //     const breakPunchOuts = FindAttendes.punches.filter(
                //         punch => punch.type === 'punchOut' && punch.punch_time >= breakStartTime && punch.punch_time <= breakEndTime
                //     );
                //     if (breakPunchOuts.length > 0) {
                //         const breakPunchIn = FindAttendes.punches.find(
                //             punch => punch.type === 'punchIn' && punch.punch_time >= breakStartTime && punch.punch_time <= breakEndTime
                //         );

                //         if (breakPunchIn) {
                //             breakTime = (breakPunchOuts[0].punch_time - breakPunchIn.punch_time) / (1000 * 60 * 60);
                //         }
                //     }
                // }
            }

            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                success: true,
                message: `Punches for the employee today`,
                data: {
                    employeeId,
                    checkInTime: checkInTime,
                    checkOutTime: checkOutTime,
                    totalWorkingHours: totalWorkingHours,
                    today_activity: FindAttendes,
                },
            });
        } else {
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                success: true,
                message: "No punches found for the employee today",
                data: {
                    employeeId,
                    punches: [],
                },
            });
        }
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const getEmployeeAttendanceDetails = async (req, res, next) => {
    try {
        const employeeId = req.params.id;
        const requestedDate = req.query.date;

        if (!requestedDate) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusCodes.BAD_REQUEST,
                success: false,
                message: "Date is required",
            });
        }

        const currentDateIST = new Date(requestedDate).toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        const currentDate = new Date(currentDateIST).setHours(0, 0, 0, 0);

        let employee = await Employee.findById(employeeId);
        if (!employee) {
            return next(new ErrorHandler(`Employee not found with id ${employeeId}`, StatusCodes.NOT_FOUND));
        }

        const employeeAttendanceRecord = await Attendance.findOne({
            date: currentDate,
            "attendanceDetails.employeeId": employee._id,
        });

        if (!employeeAttendanceRecord) {
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                success: true,
                message: "No attendance found for the employee on the specified date",
                data: {
                    employeeId,
                    checkInTime: '00:00',
                    checkOutTime: '00:00',
                    totalWorkingHours: 0,
                    today_activity: null,
                },
            });
        }

        const punches = employeeAttendanceRecord.attendanceDetails.find(detail =>
            detail.employeeId.equals(employee._id)
        )?.punches || [];

        const present = punches.some(punch => punch.type === 'punchIn' ? true : false);
        const status = punches[0]?.type

        let checkInTime = '00:00';
        let checkOutTime = '00:00';
        let totalWorkingHours = "00:00";

        if (punches.length > 0) {
            const firstPunch = new Date(punches[0]?.punch_time);
            const punchOuts = punches.filter(punch => punch.type === 'punchOut');
            const lastPunchOut = punchOuts.length > 0 ? punchOuts[punchOuts.length - 1].punch_time : null;
            const lastPunchTime = lastPunchOut ? new Date(lastPunchOut) : null;
            const lastPunchType = punches[punches.length - 1].type;
            const excludeLastPunchInTime = lastPunchType === 'punchIn';

            checkOutTime = lastPunchTime && !excludeLastPunchInTime
                ? lastPunchTime.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' })
                : '00:00';
            checkInTime = firstPunch.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' });

            if (!excludeLastPunchInTime) {
                const totalHours = (lastPunchTime - firstPunch) / (1000 * 60 * 60);
                totalWorkingHours = formatTotalWorkingHours(totalHours);
            }
        }

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Attendance details for the employee on the specified date retrieved successfully`,
            data: {
                employeeId,
                checkInTime,
                checkOutTime,
                totalWorkingHours,
                today_activity: {
                    date: employeeAttendanceRecord.date,
                    present,
                    status,
                    punches,
                    _id: employeeAttendanceRecord._id,
                },
            },
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const getEmployeeAttendanceList = async (req, res, next) => {
    try {
        const employeeId = req.params.id;
        const page = parseInt(req.query.page_no) || 1;
        const perPage = parseInt(req.query.items_per_page) || 10;
        const skip = (page - 1) * perPage;

        let employee = await Employee.findById(employeeId);
        if (!employee) {
            return next(new ErrorHandler(`Employee not found with id ${employeeId}`, StatusCodes.NOT_FOUND));
        }

        const attendanceRecords = await Attendance.find({
            "attendanceDetails.employeeId": employee._id,
        });

        if (!attendanceRecords || attendanceRecords.length === 0) {
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                success: true,
                message: "No attendance records found for the employee",
                data: {
                    employeeId,
                    attendanceList: [],
                    pagination: {
                        current_page_item: 0,
                        page_no: parseInt(page),
                        items_per_page: parseInt(perPage),
                    },
                },
            });
        }

        const holidays = await Holiday.find();

        const processedDates = new Set();
        const attendanceList = [];

        attendanceRecords.forEach((record) => {
            const punches = record.attendanceDetails.find((detail) =>
                detail.employeeId.equals(employee._id)
            )?.punches || [];

            punches.forEach((punch, index) => {
                const date = punch.punch_time.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' });

                // Skip processing if the date is already processed
                if (processedDates.has(date)) {
                    return;
                }

                processedDates.add(date);

                const isHoliday = holidays.some((holiday) => {
                    const holidayDate = new Date(holiday.holiday_date).toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' });
                    return holidayDate === date;
                });

                let checkInTime = '00:00';
                let breakTime = '00:00';
                let checkOutTime = '00:00';
                let hours = '00:00';
                let status = 'Absent';

                const punchesForDate = punches.filter(
                    (p) => p.punch_time.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata' }) === date
                );

                if (punchesForDate.length > 0) {
                    checkInTime = punchesForDate[0].punch_time.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' });
                    status = isHoliday ? 'Holiday' : 'Present';
                }

                if (punchesForDate.length > 1) {
                    const lastPunch = punchesForDate[punchesForDate.length - 1];

                    if (lastPunch.type === 'breakEnd') {
                        breakTime = lastPunch.punch_time.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' });
                    } else if (lastPunch.type === 'punchOut') {
                        checkOutTime = lastPunch.punch_time.toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' });
                        status = isHoliday ? 'Holiday' : 'Present';
                    }

                    if (lastPunch.type === 'punchOut' || lastPunch.type === 'breakEnd') {
                        const timeDiff = lastPunch.punch_time - punchesForDate[0].punch_time;
                        hours = formatTotalWorkingHours(timeDiff / (1000 * 60 * 60));
                    }
                }

                attendanceList.push({
                    date,
                    checkInTime,
                    breakTime,
                    checkOutTime,
                    hours,
                    status,
                });
            });
        });

        const paginatedAttendanceList = attendanceList.slice(skip, skip + perPage);

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Attendance details for the employee retrieved successfully`,
            data: {
                employeeId,
                attendanceList: paginatedAttendanceList,
                pagination: {
                    current_page_item: paginatedAttendanceList.length,
                    page_no: parseInt(page),
                    items_per_page: parseInt(perPage),
                },
            },
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const getWeeklyEmployeeAttendanceCount = async (req, res, next) => {
    try {
        const currentDate = moment().startOf('isoWeek');
        const endDate = currentDate.clone().add(6, 'days');

        const employeeAttendanceCounts = [];

        for (let date = currentDate.clone(); date.isSameOrBefore(endDate); date.add(1, 'day')) {
            const presentEmployees = await Attendance.find({
                date: date.toDate(),
                "attendanceDetails.present": 1,
            }).populate('attendanceDetails.employeeId', 'first_name last_name user_id designation mobile avatar');

            const presentEmployeesCount = presentEmployees.reduce((total, employeeAttendance) => {
                return total + employeeAttendance.attendanceDetails.filter(detail => detail.present).length;
            }, 0);

            const absentEmployeesCount = await Employee.countDocuments({
                _id: {
                    $nin: presentEmployees.flatMap(employeeAttendance => {
                        return employeeAttendance.attendanceDetails.map(detail => detail.employeeId._id);
                    })
                },
            });

            employeeAttendanceCounts.push({
                date: date.toISOString(),
                presentEmployeesCount,
                absentEmployeesCount,
            });
        }

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Daily employee attendance counts for the first 6 days of the week retrieved successfully (excluding Sundays)`,
            data: {
                startDate: currentDate.toISOString(),
                endDate: endDate.toISOString(),
                employeeAttendanceCounts,
            },
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const getAllAttendance = async (req, res, next) => {
    try {
        const allAttendance = await Attendance.find().populate({
            path: 'attendanceDetails.employeeId',
            model: 'Employee',
            select: 'first_name last_name avatar userId designation join_date ',
        });

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: "All attendance records retrieved successfully",
            data: allAttendance,
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    getAttendanceDetails,
    getEmployeeAttendanceSummary,
    getAttendanceSheet,
    getTodayAttendance,
    getEmployeePunchesToday,
    getEmployeeAttendanceDetails,
    getEmployeeAttendanceList,
    getWeeklyEmployeeAttendanceCount,
    getAllAttendance
};