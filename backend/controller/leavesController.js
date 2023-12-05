const { StatusCodes } = require("http-status-codes");
const { validationResult } = require('express-validator');
const Leaves = require("../models/leavesModel");
const Employee = require("../models/employeeModel"); // Import your employee model
const ErrorHander = require("../middleware/errorhander");

const applyLeave = async (req, res, next) => {
    try {
        const { employeeId, fromDate, toDate, type, halfDay, comments } = req.body;
        const leaveApplication = new Leaves({
            employeeId,
            fromDate,
            toDate,
            type,
            halfDay,
            status: 'Pending',
            comments,
        });

        const savedLeaveApplication = await leaveApplication.save();
        const employee = await Employee.findOne({ _id: employeeId });

        if (!employee) {
            return next(new ErrorHander("Employee not found", StatusCodes.NOT_FOUND));
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
        return next(new ErrorHander(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}


const updateLeaveStatus = async (req, res, next) => {
    try {
        const { leaveId, newStatus } = req.body;

        if (!leaveId || !newStatus) {
            return next(new ErrorHander('leaveId and newStatus are required', StatusCodes.BAD_REQUEST));
        }

        const leave = await Leaves.findById(leaveId);
        if (!leave) {
            return next(new ErrorHander('Leave not found', StatusCodes.NOT_FOUND));
        }

        leave.status = newStatus;
        await leave.save();
        const employee = await Employee.findOne({ leaves: leaveId });

        if (!employee) {
            return next(new ErrorHander('Employee not found', StatusCodes.NOT_FOUND));
        }

        const leaveIndex = employee.leaves.indexOf(leaveId);
        if (leaveIndex !== -1) {
            employee.leaves[leaveIndex].status = newStatus;
            await employee.save();
        }

        res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Leave status updated to ${newStatus}`,
            data: leave,
        });
    } catch (error) {
        return next(new ErrorHander(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    applyLeave,
    updateLeaveStatus
}
