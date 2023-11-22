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



// const updateEmployee = async (req, res, next) => {
//     try {
//         const employeeId = req.params.id;

//         const {
//             first_name,
//             last_name,
//             address,
//             city,
//             email,
//             country,
//             avatar: newAvatar,
//             date_of_birth,
//             designation,
//             join_date,
//             education,
//             gender,
//             mobile,
//             status
//         } = req.body;

//         const updatedEmployeeData = {
//             first_name,
//             last_name,
//             address,
//             city,
//             email,
//             country,
//             date_of_birth,
//             designation,
//             join_date,
//             education,
//             gender,
//             mobile,
//             status
//         };

//         if (newAvatar) {
//             const newAvatarURL = await FileUplaodToFirebase.uploadCertifiesToFierbase(newAvatar);

//             updatedEmployeeData.avatar = newAvatarURL;

//             const employeEE = await Employee.findById(employeeId);

//             const userId = generateUniqueUserId(first_name, last_name, date_of_birth);

//             const updatedUser = await User.findOneAndUpdate(
//                 { user_id: employeEE.user_id },
//                 {
//                     $set: {
//                         user_id: userId,
//                         username: `${first_name} ${last_name}`,
//                         avatar: newAvatarURL,
//                     },
//                 },
//                 { new: true }
//             );

//             updatedEmployeeData.user_id = userId;

//             if (!updatedUser) {
//                 return next(new ErrorHander(`User not found with user_id ${userId}`, StatusCodes.NOT_FOUND));
//             }
//         }

//         // Update the employee
//         const updatedEmployee = await Employee.findByIdAndUpdate(
//             employeeId,
//             { $set: updatedEmployeeData },
//             { new: true }
//         );

//         if (!updatedEmployee) {
//             return next(new ErrorHander(`Employee not found with id ${employeeId}`, StatusCodes.NOT_FOUND));
//         }

//         return res.status(StatusCodes.OK).json({
//             status: StatusCodes.OK,
//             success: true,
//             message: `Employee updated successfully`,
//             data: updatedEmployee,
//         });
//     } catch (error) {
//         return next(new ErrorHander(error, StatusCodes.INTERNAL_SERVER_ERROR));
//     }
// };