const { StatusCodes } = require("http-status-codes");
const { validationResult } = require('express-validator');
const Leaves = require("../models/leavesModel");
const Employee = require("../models/employeeModel"); // Import your employee model
const employeeModel = require("../models/employeeModel");

const applyLeave = async (req, res, next) => {
    try {
        // Validation using express-validator
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                status: StatusCodes.BAD_REQUEST,
                success: false,
                message: 'Validation error',
                errors: errors.array(),
            });
        }

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

        // Update the employee document with the new leave
        const employee = await Employee.findOne({ _id: employeeId });
        if (!employee) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: StatusCodes.NOT_FOUND,
                success: false,
                message: 'Employee not found',
            });
        }

        employeeModel.leaves.push(savedLeaveApplication._id); // Assuming leaves array stores leave IDs
        await employee.save();

        res.status(StatusCodes.CREATED).json({
            status: StatusCodes.CREATED,
            success: true,
            message: 'Leave application submitted successfully',
            data: savedLeaveApplication,
        });
    } catch (error) {
        console.error(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message: 'Failed to submit leave application',
            error: error.message || 'Internal Server Error',
        });
    }
}

module.exports = applyLeave;
