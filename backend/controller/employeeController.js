const Employee = require("../models/employeeModel");
const { StatusCodes } = require("http-status-codes");
const ErrorHander = require("../middleware/errorhander");
const User = require("../models/userModel");
const FileUplaodToFirebase = require("../middleware/multerConfig");

// const addEmployee = async (req, res, next) => {
//     try {
//         const {
//             first_name,
//             last_name,
//             gender,
//             mobile,
//             password,
//             designation,
//             address,
//             email,
//             date_of_birth,
//             education,
//             join_date,
//             status,
//             create_user
//         } = req.body;

//         if (!first_name || !last_name || !email || !password) {
//             return next(new ErrorHander("All fields are required for registration", StatusCodes.BAD_REQUEST));
//         }

//         const existingUser = await Employee.findOne({ email });

//         if (existingUser) {
//             return next(new ErrorHander("Email is already in use", StatusCodes.BAD_REQUEST));
//         }

//         const avatar = req.file;

//         if (!avatar) {
//             return next(new ErrorHander("Avatar image is required", StatusCodes.BAD_REQUEST));
//         }

//         let certificateDoanloadURL = await FileUplaodToFirebase.uploadCertifiesToFierbase(avatar);

//         const employee = new Employee({
//             first_name,
//             last_name,
//             gender,
//             mobile,
//             password,
//             designation,
//             address,
//             email,
//             date_of_birth,
//             education,
//             join_date,
//             status,
//             create_user,
//             avatar: certificateDoanloadURL,
//         });

//         const savedEmployee = await employee.save();
//         if (savedEmployee) {
//             if (create_user === 1) {
//                 const user = new User({
//                     username: savedEmployee.first_name,
//                     email: savedEmployee.email,
//                     password: savedEmployee.password,
//                     role: 'employee',
//                 });

//                 await user.save();
//             }

//             return res.status(StatusCodes.CREATED).json({
//                 status: StatusCodes.CREATED,
//                 success: true,
//                 message: `Employee${create_user === 1 ? ' and User' : ''} created successfully`,
//             });
//         } else {
//             return next(new ErrorHander("Employee creation failed", StatusCodes.INTERNAL_SERVER_ERROR));
//         }
//     } catch (error) {
//         return next(new ErrorHander(error, StatusCodes.INTERNAL_SERVER_ERROR));
//     }
// }


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

        let certificateDownloadURL = await FileUplaodToFirebase.uploadCertifiesToFierbase(avatar);

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
            user_name: userId,
        });

        const savedEmployee = await employee.save();
        if (savedEmployee) {
            if (Number(create_user) === 1) {
                const user = new User({
                    username: userId,
                    email: savedEmployee.email,
                    password: savedEmployee.password,
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
                        username: userId,
                        email: savedEmployee.email,
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

function generateUniqueUserId(firstName, lastName, dateOfBirth) {
    const firstTwoLetters = firstName.slice(0, 2).toUpperCase();
    const firstLetterLastName = lastName.slice(0, 1).toUpperCase();
    const birthYearDigits = new Date(dateOfBirth).getFullYear().toString();

    const userId = `${firstTwoLetters}${firstLetterLastName}${birthYearDigits}`;
    return userId;
}

const getAllEmployees = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const perPage = parseInt(req.query.perPage) || 10;

        const { searchtext } = req.query;

        const query = searchtext ? { $or: [{ first_name: { $regex: searchtext, $options: 'i' } }, { last_name: { $regex: searchtext, $options: 'i' } }] } : {};

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
                current_page: parseInt(page),
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
        } = req.body;

        const updatedEmployee = await Employee.findByIdAndUpdate(
            employeeId,
            {
                $set: {
                    first_name,
                    last_name,
                    address,
                    city,
                    email,
                    country,
                },
            },
            { new: true }
        );

        if (!updatedEmployee) {
            return next(new ErrorHander(`Employee not found with id ${employeeId}`, StatusCodes.NOT_FOUND));
        }

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: `Employee updated successfully`,
        });
    } catch (error) {
        return next(new ErrorHander(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    addEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee
};