const { StatusCodes } = require("http-status-codes");
const Leaves = require("../models/leavesModel");
const Employee = require("../models/employeeModel");
const ErrorHandler = require("../middleware/errorhander");
const { addLeaveAttendance } = require("./punchController");
const Attendance = require("../models/attendanceModel");

const applyLeave = async (req, res, next) => {
    try {
        const { employeeId, fromDate, toDate, type, duration, comments } = req.body;

        const today = new Date().setHours(0, 0, 0, 0);
        const selectedFromDate = new Date(fromDate).setHours(0, 0, 0, 0);

        if (selectedFromDate < today) {
            return next(new ErrorHandler('From date must be in the future', StatusCodes.BAD_REQUEST));
        }

        let selectedToDate = null;

        if (duration === 'Full Day') {
            selectedToDate = selectedFromDate;
        } else if (duration === 'First Half' || duration === 'Second Half') {
            selectedToDate = selectedFromDate;
        } else {
            selectedToDate = new Date(toDate).setHours(0, 0, 0, 0);

            if (selectedToDate < today || selectedToDate < selectedFromDate) {
                return next(new ErrorHandler('To date must be in the future and not before the from date', StatusCodes.BAD_REQUEST));
            }
        }

        // Check for overlapping leave
        const overlappingLeave = await Leaves.findOne({
            employeeId,
            $or: [
                {
                    fromDate: { $lte: selectedToDate },
                    toDate: { $gte: selectedFromDate }
                },
                {
                    fromDate: { $gte: selectedFromDate, $lte: selectedToDate },
                    toDate: { $gte: selectedToDate }
                }
            ]
        });

        if (overlappingLeave) {
            return next(new ErrorHandler('Leave already exists for the specified date range', StatusCodes.BAD_REQUEST));
        }

        const leaveApplication = new Leaves({
            employeeId,
            fromDate: new Date(selectedFromDate),
            toDate: new Date(selectedToDate),
            type,
            duration,
            status: 'Pending',
            comments,
        });

        const savedLeaveApplication = await leaveApplication.save();
        const employee = await Employee.findOne({ _id: employeeId });

        if (!employee) {
            return next(new ErrorHandler('Employee not found', StatusCodes.NOT_FOUND));
        }

        employee.leaves.push(savedLeaveApplication._id);
        await employee.save();

        res.status(StatusCodes.CREATED).json({
            status: StatusCodes.CREATED,
            success: true,
            message: 'Leave application submitted successfully',
            data: savedLeaveApplication,
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const updateLeaveStatus = async (req, res, next) => {
    try {
        const { leaveId, newStatus } = req.body;

        if (!leaveId || !newStatus) {
            return next(new ErrorHandler('leaveId and newStatus are required', StatusCodes.BAD_REQUEST));
        }

        const leave = await Leaves.findById(leaveId);
        if (!leave) {
            return next(new ErrorHandler('Leave not found', StatusCodes.NOT_FOUND));
        }

        if (newStatus === 'Approved' && leave.status !== 'Approved') {
            await addLeaveAttendance(leave.employeeId, leave.fromDate, leave.toDate);
        } else if (newStatus === 'Approved' && leave.status === 'Approved') {
            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                success: true,
                message: 'Leave status is already Approved',
                data: leave,
            });
        }

        leave.status = newStatus;
        await leave.save();

        res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Leave status updated to ${newStatus}`,
            data: leave,
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const getAllLeaves = async (req, res, next) => {
    try {
        const { fromDate, toDate, status, type, search_text } = req.query;

        const filters = {};
        if (fromDate) filters.fromDate = { $gte: new Date(fromDate) };
        if (toDate) filters.toDate = { $lte: new Date(toDate) };
        if (status) filters.status = status;
        if (type) filters.type = type;

        if (search_text) {
            filters.$or = [
                { 'employeeId.first_name': { $regex: new RegExp(search_text, 'i') } },
                { 'employeeId.last_name': { $regex: new RegExp(search_text, 'i') } },
                { 'employeeId.userId': { $regex: new RegExp(search_text, 'i') } },
            ];
        }
        const leaves = await Leaves.find(filters)
            .populate({
                path: 'employeeId',
                model: 'Employee',
                select: 'first_name last_name avatar userId designation',
            });

        const leavesWithDays = leaves.map(leave => {
            const fromDate = new Date(leave.fromDate);
            const toDate = new Date(leave.toDate);
            const diffInMilliseconds = toDate - fromDate;
            const days = diffInMilliseconds / (1000 * 60 * 60 * 24); // Convert milliseconds to days
            return { ...leave.toObject(), numberOfDays: days };
        });

        res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: 'Leave applications with user information and number of days retrieved successfully',
            data: leavesWithDays,
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const getLeaveById = async (req, res, next) => {
    try {
        const leaveId = req.params.id;

        const leave = await Leaves.findById(leaveId).populate({
            path: 'employeeId',
            model: 'Employee',
            select: 'first_name last_name avatar userId designation',
        });

        if (!leave) {
            return next(new ErrorHandler('Leave not found', StatusCodes.NOT_FOUND));
        }

        res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: 'Leave details retrieved successfully',
            data: leave,
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const deleteLeave = async (req, res, next) => {
    try {
        const leaveId = req.params.id;
        const leave = await Leaves.findById(leaveId);

        if (!leave) {
            return next(new ErrorHandler('Leave not found', StatusCodes.NOT_FOUND));
        }

        const employee = await Employee.findOne({ _id: leave.employeeId });

        if (!employee) {
            return next(new ErrorHandler('Employee not found', StatusCodes.NOT_FOUND));
        }

        const leaveIndex = employee.leaves.indexOf(leaveId);

        if (leaveIndex !== -1) {
            employee.leaves.splice(leaveIndex, 1);
        }

        const fromDate = leave.fromDate.setHours(0, 0, 0, 0);
        const toDate = leave.toDate.setHours(23, 59, 59, 999);

        await Attendance.updateMany(
            {
                date: { $gte: fromDate, $lte: toDate },
                "attendanceDetails.employeeId": employee._id,
            },
            {
                $pull: {
                    attendanceDetails: {
                        employeeId: employee._id,
                        type_attendance: "leave",
                    },
                },
            }
        );

        await Employee.updateMany(
            { _id: employee._id, 'attendances.date': { $gte: fromDate, $lte: toDate } },
            {
                $pull: {
                    'attendances': { date: { $gte: fromDate, $lte: toDate } }
                }
            }
        );

        await employee.save();
        await leave.remove();

        res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: 'Leave deleted successfully',
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const getLeavesByEmployeeId = async (req, res, next) => {
    try {
        const employeeId = req.params.employeeId;
        const page = parseInt(req.query.page_no) || 1;
        const pageSize = parseInt(req.query.items_per_page) || 10;

        const employee = await Employee.findOne({ _id: employeeId });

        if (!employee) {
            return next(new ErrorHandler('Employee not found', StatusCodes.NOT_FOUND));
        }

        const totalLeaves = await Leaves.countDocuments({ employeeId });
        const totalPages = Math.ceil(totalLeaves / pageSize);

        const leaves = await Leaves.find({ employeeId })
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .populate({
                path: 'employeeId',
                model: 'Employee',
                select: 'first_name last_name avatar userId designation',
            });

        const leavesWithDays = leaves.map(leave => {
            const fromDate = new Date(leave.fromDate);
            const toDate = new Date(leave.toDate);
            const diffInMilliseconds = toDate - fromDate;
            const days = diffInMilliseconds / (1000 * 60 * 60 * 24);
            return { ...leave.toObject(), numberOfDays: days };
        });

        res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: 'Leave applications with user information and number of days retrieved successfully',
            data: {
                leaves: leavesWithDays,
                totalPages,
                currentPage: page,
            },
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    applyLeave,
    updateLeaveStatus,
    getAllLeaves,
    getLeaveById,
    deleteLeave,
    getLeavesByEmployeeId
}