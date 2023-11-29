const Employee = require("../models/employeeModel");
const { StatusCodes } = require("http-status-codes");
const ErrorHander = require("../middleware/errorhander");
const User = require("../models/userModel");
const FileUplaodToFirebase = require("../middleware/multerConfig");
const { generateUniqueUserId } = require("../utils/helper");

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
            create_user
        } = req.body;

        if (!first_name || !last_name) {
            return next(new ErrorHander("First name and last name are required", StatusCodes.BAD_REQUEST));
        }

        const avatar = req.file;

        if (!avatar) {
            return next(new ErrorHander("Avatar image is required", StatusCodes.BAD_REQUEST));
        }

        const certificateDownloadURL = await FileUplaodToFirebase.uploadCertifiesToFierbase(avatar);

        const userId = generateUniqueUserId(first_name, last_name, date_of_birth);

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
            create_user,
            avatar: certificateDownloadURL,
            user_id: userId,
        });

        const savedEmployee = await employee.save();

        if (savedEmployee) {
            if (Number(create_user) === 1) {
                const user = new User({
                    user_id: userId,
                    avatar: certificateDownloadURL,
                    password: savedEmployee.password,
                    username: first_name + "" + last_name,
                    role: 'employee',
                });

                await user.save();
            }

            return res.status(StatusCodes.CREATED).json({
                status: StatusCodes.CREATED,
                success: true,
                message: `Employee${Number(create_user) === 1 ? ' and User' : ''} created successfully`,
                data: {
                    employee: savedEmployee,
                    user: Number(create_user) === 1 ? {
                        username: first_name + "" + last_name,
                        role: 'employee',
                    } : null,
                },
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
        const page = parseInt(req.query.page_no) || 1;
        const perPage = parseInt(req.query.items_per_page) || 10;

        const { search_text } = req.query;

        const query = search_text ? { $or: [{ first_name: { $regex: search_text, $options: 'i' } }, { last_name: { $regex: search_text, $options: 'i' } }] } : {};

        const skip = (page - 1) * perPage;
        const employees = await Employee.find(query)
            .skip(skip)
            .limit(perPage);
        const totalEmployees = await Employee.countDocuments(query);
        const allEmployees = await Employee.countDocuments()

        const totalPages = Math.ceil(totalEmployees / perPage);

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            data: employees,
            pagination: {
                total_items: allEmployees,
                total_pages: totalPages,
                current_page_item: employees.length,
                page_no: parseInt(page),
                items_per_page: parseInt(perPage),
            },
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

const updateEmployee = async (req, res, next) => {
    try {
        const employeeId = req.params.id;

        const {
            first_name,
            last_name,
            address,
            city,
            email,
            country,
            date_of_birth,
            designation,
            join_date,
            education,
            gender,
            mobile,
            status
        } = req.body;

        const newAvatar = req.file;

        const updatedEmployeeData = {
            first_name,
            last_name,
            address,
            city,
            email,
            country,
            date_of_birth,
            designation,
            join_date,
            education,
            gender,
            mobile,
            status
        };

        if (newAvatar) {
            const existingEmployee = await Employee.findById(employeeId);

            if (existingEmployee.avatar) {
                await FileUplaodToFirebase.deleteFileFromFirebase(existingEmployee.avatar);
            }

            const newAvatarURL = await FileUplaodToFirebase.uploadCertifiesToFierbase(newAvatar);
            updatedEmployeeData.avatar = newAvatarURL;
        }

        const updatedEmployee = await Employee.findByIdAndUpdate(
            employeeId,
            { $set: updatedEmployeeData },
            { new: true }
        );

        if (!updatedEmployee) {
            return next(new ErrorHander(`Employee not found with id ${employeeId}`, StatusCodes.NOT_FOUND));
        }

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Employee updated successfully`,
            data: updatedEmployee,
        });
    } catch (error) {
        return next(new ErrorHander(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const deleteEmployee = async (req, res, next) => {
    try {
        const employeeId = req.params.id;

        const existingEmployee = await Employee.findById(employeeId);

        if (!existingEmployee) {
            return next(new ErrorHander(`Employee not found with id ${employeeId}`, StatusCodes.NOT_FOUND));
        }

        let deletedUser;
        const userToDelete = await User.findOne({ user_id: existingEmployee.user_id });

        if (userToDelete) {
            deletedUser = await User.findOneAndDelete({ user_id: existingEmployee.user_id });
        }

        if (existingEmployee.avatar) {
            await FileUplaodToFirebase.deleteFileFromFirebase(existingEmployee.avatar);
        }

        const deletedEmployee = await Employee.findByIdAndDelete(employeeId);

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Employee and associated user deleted successfully`,
            data: {
                deletedEmployee,
                deletedUser,
            },
        });
    } catch (error) {
        return next(new ErrorHander(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    addEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
};