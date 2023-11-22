const { StatusCodes } = require("http-status-codes");
const ErrorHander = require("../middleware/errorhander");
const Employee = require("../models/employeeModel");

const getEmployeeCounts = async (req, res, next) => {
    try {
        const totalEmployees = await Employee.countDocuments();
        const createUser_employee = await Employee.countDocuments({ create_user: 1 });
        const createEmployee = await Employee.countDocuments({ create_user: 0 });
        const active = await Employee.countDocuments({ status: 1 });
        const inActive = await Employee.countDocuments({ status: 0 });

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            data: {
                totalEmployees,
                createEmployee,
                createUser_employee,
                active,
                inActive,
            },
        });
    } catch (error) {
        return next(new ErrorHander(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    getEmployeeCounts,
};
