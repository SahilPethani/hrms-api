const Employee = require("../models/employeeModel");
const { StatusCodes } = require("http-status-codes");
const ErrorHander = require("../middleware/errorhander");
const User = require("../models/userModel");
const FileUplaodToFirebase = require("../middleware/multerConfig");

const addEmployee = async (req, res, next) => {
    try {
        const {
            first_name,
            last_name,
            gender,
            mobile,
            password,
            designation,
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

        let certificateDoanloadURL = await FileUplaodToFirebase.uploadCertifiesToFierbase(avatar);

        const employee = new Employee({
            first_name,
            last_name,
            gender,
            mobile,
            password,
            designation,
            address,
            email,
            date_of_birth,
            education,
            join_date,
            status,
            avatar: certificateDoanloadURL,
        });

        const savedEmployee = await employee.save();
        if (savedEmployee) {
            const user = new User({
                username: savedEmployee.first_name,
                email: savedEmployee.email,
                password: savedEmployee.password,
                role: 'employee',
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

const getAllEmployees = async (req, res, next) => {
    try {
        const employees = await Employee.find();

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            data: employees,
        });
    } catch (error) {
        return next(new ErrorHander(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const getEmployeeById = async (req, res, next) => {
    try {
        const employeeId = req.params.id;

        const employee = await Employee.findById(employeeId);

        if (!employee) {
            return next(new ErrorHander(`Employee not found with id ${employeeId}`, StatusCodes.NOT_FOUND));
        }

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            data: employee,
        });
    } catch (error) {
        return next(new ErrorHander(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    addEmployee,
    getAllEmployees,
    getEmployeeById,
};