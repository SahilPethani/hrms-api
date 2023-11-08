const Employee = require("../models/employeeModel");
const { StatusCodes } = require("http-status-codes");
const ErrorHander = require("../middleware/errorhander");
const User = require("../models/userModel");

const addEmployee = async (req, res, next) => {
    try {
        const {
            first_name,
            last_name,
            gender,
            mobile,
            password,
            designation,
            department,
            address,
            email,
            date_of_birth,
            education,
            join_date,
            status,
        } = req.body;

        if (!first_name || !last_name || !email || !password) {
            return next(new ErrorHander("All fields are required for registration", StatusCodes.BAD_REQUEST));
        }

        const existingUser = await Employee.findOne({ email });

        if (existingUser) {
            return next(new ErrorHander("Email is already in use", StatusCodes.BAD_REQUEST));
        }

        const avatar = req.file;

        if (!avatar) {
            return next(new ErrorHander("Avatar image is required", StatusCodes.BAD_REQUEST));
        }

        const employee = new Employee({
            first_name,
            last_name,
            gender,
            mobile,
            password,
            designation,
            department,
            address,
            email,
            date_of_birth,
            education,
            join_date,
            status,
            avatar: avatar.filename, // Store the file name in the database
        });

        const savedEmployee = await employee.save();
        if (savedEmployee) {
            // Employee was created successfully, now create the user
            const user = new User({
                username: savedEmployee.first_name, // Use the first name as the username
                email : savedEmployee.email,
                password: savedEmployee.password, // Employee's password
                role: 'employee', // Set the role to 'employee'
            });

            await user.save();

            return res.status(StatusCodes.CREATED).json({
                status: StatusCodes.CREATED,
                success: true,
                message: `Employee and User created successfully`,
            });
        } else {
            return next(new ErrorHander("Employee creation failed", StatusCodes.INTERNAL_SERVER_ERROR));
        }
    } catch (error) {
        return next(new ErrorHander(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
}


module.exports = {
    addEmployee
};
