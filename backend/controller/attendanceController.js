const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../middleware/errorhander");
const Employee = require("../models/employeeModel");
const Attendance = require("../models/attendanceModel");
const { calculateWorkingHours, getDayName } = require("../utils/helper");
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
                success: true,
                message: `It's a holiday. Employees don't need to punch in.`,
            });
        }

        // const hasPunchedInToday = employee.attendances.some((attendance) =>
        //     attendance.date.toISOString() === new Date(currentDate).toISOString()
        // );

        // if (hasPunchedInToday) {
        //     return next(new ErrorHandler(`Employee has already punched in today`, StatusCodes.BAD_REQUEST));
        // }

        // const currentTimeIST = new Date(currentDateIST).getHours() * 60 + new Date(currentDateIST).getMinutes();
        // const punchInTimeLimit = 9 * 60;
        // if (currentTimeIST < punchInTimeLimit) {
        //     return next(new ErrorHandler(`Punch-in allowed only before 9:00 AM IST`, StatusCodes.BAD_REQUEST));
        // }

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
        const attendanceData = {
            date: todayAttendance.date,
            present: todayAttendance.attendanceDetails[employeeAttendanceDetailsIndex].present,
            punches: todayAttendance.attendanceDetails[employeeAttendanceDetailsIndex].punches,
        };
        employee.attendances.push(attendanceData);

        await employee.save();

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Employee punched in successfully`,
            data: todayAttendance
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

        const monthlyAttendanceDetails = [];

        employee.attendances.forEach(attendanceRecord => {
            const date = attendanceRecord.date.toISOString().split('T')[0];
            const punches = attendanceRecord.punches;

            const attendanceDetail = {
                date,
                checkInTime: null,
                checkOutTime: null,
                totalWorkingHours: 0,
                present: false,
            };

            if (punches.length > 0) {
                const firstPunch = punches[0].punchIn;
                const lastPunch = punches.slice(-1)[0].punchOut || null;

                attendanceDetail.checkInTime = new Date(firstPunch).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' });
                attendanceDetail.checkOutTime = lastPunch ? new Date(lastPunch).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' }) : '00:00';

                if (lastPunch) {
                    const totalHours = calculateWorkingHours(punches);
                    attendanceDetail.totalWorkingHours = totalHours.toFixed(2);
                }

                attendanceDetail.present = true;
            }

            monthlyAttendanceDetails.push(attendanceDetail);
        });

        // Calculate Average Working Hours, Average In Time, and Average Out Time
        const totalWorkingHours = monthlyAttendanceDetails.reduce((sum, attendance) => sum + parseFloat(attendance.totalWorkingHours), 0);
        const totalCheckInTime = monthlyAttendanceDetails.reduce((sum, attendance) => sum + (attendance.checkInTime ? new Date(`2000-01-01 ${attendance.checkInTime}`).getTime() : 0), 0);
        const totalCheckOutTime = monthlyAttendanceDetails.reduce((sum, attendance) => sum + (attendance.checkOutTime ? new Date(`2000-01-01 ${attendance.checkOutTime}`).getTime() : 0), 0);

        const averageWorkingHours = (totalWorkingHours / monthlyAttendanceDetails.length).toFixed(2);
        const averageInTime = new Date(totalCheckInTime / monthlyAttendanceDetails.length).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' });
        const averageOutTime = new Date(totalCheckOutTime / monthlyAttendanceDetails.length).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' });


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
                averageWorkingHours,
                averageInTime,
                averageOutTime,
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

const getAttendanceSheet = async (req, res, next) => {
    try {
        const startDateParam = req.query.startDate;
        const endDateParam = req.query.endDate;

        const currentDate = new Date();
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const istOptions = { timeZone: 'Asia/Kolkata' };

        let startDate, endDate;

        if (startDateParam && endDateParam) {
            startDate = startDateParam
                ? new Date(`${startDateParam}T00:00:00.000Z`).toLocaleString('en-US', istOptions)
                : firstDayOfMonth.toLocaleString('en-US', istOptions);
            endDate = endDateParam
                ? new Date(`${endDateParam}T23:59:59.999Z`).toLocaleString('en-US', istOptions)
                : lastDayOfMonth.toLocaleString('en-US', istOptions);
        } else {
            startDate = firstDayOfMonth.toLocaleString('en-US', istOptions);
            endDate = lastDayOfMonth.toLocaleString('en-US', istOptions);
        }

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
                const currentDateInLoop = new Date(currentDate.getFullYear(), currentDate.getMonth(), day + 1);
                const isSunday = currentDateInLoop.getDay() === 0;
                const attendanceData = employee.attendances.find(attendance =>
                    new Date(attendance.date).getDate() === currentDateInLoop.getDate()
                );
                const isHoliday = Holidays.find((date) => {
                    const holidayDateUTC = new Date(date.holiday_date);
                    const holidayDateLocal = holidayDateUTC.toLocaleString('en-US', istOptions);
                    const currentDateInLoopLocal = currentDateInLoop.toLocaleString('en-US', istOptions);
                    return holidayDateLocal === currentDateInLoopLocal;
                });

                return {
                    date: currentDateInLoop.toLocaleString('en-US', istOptions),
                    dayName: getDayName(currentDateInLoop.getDay()),
                    present: attendanceData ? attendanceData.present === 1 : false,
                    absent: attendanceData ? attendanceData.present !== 1 : false,
                    holiday: isHoliday ? true : isSunday,
                };
            });

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
                breakTime: '00:00', // Add break time field
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
                    const firstPunch = employeeDetails.punches[0].punchIn;
                    const lastPunch = employeeDetails.punches.slice(-1)[0].punchOut || null;

                    employeeAttendance.checkInTime = new Date(firstPunch).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' });
                    employeeAttendance.checkOutTime = lastPunch ? new Date(lastPunch).toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' }) : '00:00';

                    // Calculate total working hours
                    if (lastPunch) {
                        const totalHours = calculateWorkingHours(employeeDetails.punches);
                        employeeAttendance.totalWorkingHours = totalHours.toFixed(2);
                    }

                    // Calculate break time
                    if (employeeDetails.punches.length > 0) {
                        const breakStartTime = new Date(currentDate).setHours(13, 0, 0, 0); // 1:00 PM
                        const breakEndTime = new Date(currentDate).setHours(13, 45, 0, 0); // 1:45 PM

                        const lastBreakPunchOut1 = employeeDetails.punches.filter(punch => punch.type === 'punchOut' && punch.punchOut >= breakStartTime)

                        if (lastBreakPunchOut1.length > 0) {
                            const breakPunches = employeeDetails.punches.filter(punch => {
                                return punch.type === 'punchIn' && punch.punchIn >= breakEndTime
                            });
                            if (lastBreakPunchOut1[0].punchOut) {
                                const breakMinutes = (new Date(breakPunches[0].punchIn - new Date(lastBreakPunchOut1[0].punchOut).getTime()).getTime()) / (1000 * 60);

                                employeeAttendance.breakTime = breakMinutes.toFixed(2);
                            }
                        }
                    }
                    employeeAttendance.present = true;
                }
            }

            todayAttendance.push(employeeAttendance);
        }


        const totalEmployees = await Employee.countDocuments({ /* Add your search criteria here */ });
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

module.exports = {
    punchIn,
    punchOut,
    getAttendanceDetails,
    getEmployeeAttendanceSummary,
    getAttendanceSheet,
    getTodayAttendance
};