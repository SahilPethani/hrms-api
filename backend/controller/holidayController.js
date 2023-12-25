const { StatusCodes } = require("http-status-codes");
const ErrorHandler = require("../middleware/errorhander");

const Holiday = require("../models/holidayModel");
const { addPunchForHoliday } = require("./punchController");
const Attendance = require("../models/attendanceModel");
const Employee = require("../models/employeeModel");

const addHoliday = async (req, res, next) => {
    try {
        const { holiday_no, holiday_name, holiday_date, detail, status } = req.body;
        if (!holiday_no || !holiday_name || !holiday_date) {
            return next(new ErrorHandler("Holiday number, name, and date are required", StatusCodes.BAD_REQUEST));
        }
        const today = new Date();
        const selectedDate = new Date(holiday_date);
        if (selectedDate <= today) {
            return next(new ErrorHandler("Invalid date. Holidays must be set for future dates only.", StatusCodes.BAD_REQUEST));
        }
        const isSunday = selectedDate.getDay() === 0;
        if (isSunday) {
            return next(new ErrorHandler("Holidays cannot be added on Sundays", StatusCodes.BAD_REQUEST));
        }
        const formattedHolidayDate = selectedDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
        const existingHoliday = await Holiday.findOne({ holiday_date: formattedHolidayDate });
        if (existingHoliday) {
            return next(new ErrorHandler("A holiday already exists for the specified date", StatusCodes.BAD_REQUEST));
        }
        const holiday = new Holiday({
            holiday_no,
            holiday_name,
            holiday_date: formattedHolidayDate,
            detail,
            status
        });
        const savedHoliday = await holiday.save();
        addPunchForHoliday(formattedHolidayDate);
        return res.status(StatusCodes.CREATED).json({
            status: StatusCodes.CREATED,
            success: true,
            message: "Holiday created successfully",
            data: savedHoliday,
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const getAllHolidays = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page_no) || 1;
        const perPage = parseInt(req.query.items_per_page) || 10;
        const search_text = req.query.search_text || '';
        const query = search_text
            ? {
                $or: [
                    { holiday_no: { $regex: search_text, $options: 'i' } },
                    { holiday_name: { $regex: search_text, $options: 'i' } },
                ],
            }
            : {};

        const skip = (page - 1) * perPage;
        const holidays = await Holiday.find(query)
            .skip(skip)
            .limit(perPage);

        const totalHolidays = await Holiday.countDocuments(query);
        const totalPages = Math.ceil(totalHolidays / perPage);

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            data: holidays,
            pagination: {
                total_items: totalHolidays,
                total_pages: totalPages,
                current_page_item: holidays.length,
                page_no: parseInt(page),
                items_per_page: parseInt(perPage),
            },
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const getAllHolidaysEmployee = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page_no) || 1;
        const perPage = parseInt(req.query.items_per_page) || 10;
        const search_text = req.query.search_text || '';

        // Updated query to include status: 1
        const query = {
            $and: [
                { status: 1 },
                {
                    $or: [
                        { holiday_no: { $regex: search_text, $options: 'i' } },
                        { holiday_name: { $regex: search_text, $options: 'i' } },
                    ],
                },
            ],
        };

        const skip = (page - 1) * perPage;
        const holidays = await Holiday.find(query)
            .skip(skip)
            .limit(perPage);

        const totalHolidays = await Holiday.countDocuments(query);
        const totalPages = Math.ceil(totalHolidays / perPage);

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            data: holidays,
            pagination: {
                total_items: totalHolidays,
                total_pages: totalPages,
                current_page_item: holidays.length,
                page_no: parseInt(page),
                items_per_page: parseInt(perPage),
            },
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const getHolidayById = async (req, res, next) => {
    try {
        const holidayId = req.params.id;
        const holiday = await Holiday.findById(holidayId);

        if (!holiday) {
            return next(new ErrorHandler(`Holiday not found with id ${holidayId}`, StatusCodes.NOT_FOUND));
        }

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            data: holiday,
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const updateHoliday = async (req, res, next) => {
    try {
        const holidayId = req.params.id;
        const { holiday_no, holiday_name, holiday_date, detail, status } = req.body;

        const updatedHolidayData = {
            holiday_no,
            holiday_name,
            holiday_date,
            detail,
            status
        };

        const existingHoliday = await Holiday.findById(holidayId);

        if (!existingHoliday) {
            return next(new ErrorHandler(`Holiday not found with id ${holidayId}`, StatusCodes.NOT_FOUND));
        }

        const isSunday = new Date(holiday_date).getDay() === 0;
        if (isSunday) {
            return next(new ErrorHandler("Holidays cannot be updated on Sundays", StatusCodes.BAD_REQUEST));
        }

        const today = new Date();
        const selectedDate = new Date(holiday_date);

        if (selectedDate <= today) {
            return next(new ErrorHandler("Invalid date. Holidays must be set for future dates only.", StatusCodes.BAD_REQUEST));
        }

        const updatedHoliday = await Holiday.findByIdAndUpdate(
            holidayId,
            { $set: updatedHolidayData },
            { new: true }
        );

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: "Holiday updated successfully",
            data: updatedHoliday,
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const deleteHoliday = async (req, res, next) => {
    try {
        const holidayId = req.params.id;

        const existingHoliday = await Holiday.findById(holidayId);

        if (!existingHoliday) {
            return next(new ErrorHandler(`Holiday not found with id ${holidayId}`, StatusCodes.NOT_FOUND));
        }

        const holidayDate = new Date(existingHoliday.holiday_date);

        await Attendance.deleteMany({
            date: {
                $gte: new Date(holidayDate),
                $lt: new Date(holidayDate.getTime() + 24 * 60 * 60 * 1000),
            },
        });

        await Employee.updateMany(
            { 'attendances.date': new Date(holidayDate) },
            {
                $pull: {
                    attendances: { date: new Date(holidayDate) }
                }
            }
        );

        // Delete the holiday
        const deletedHoliday = await Holiday.findByIdAndDelete(holidayId);

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: "Holiday deleted successfully",
            data: deletedHoliday,
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const getCurrentMonthHolidays = async (req, res, next) => {
    try {
        const options = { timeZone: 'Asia/Kolkata' };
        const indiaDate = new Date().toLocaleString('en-US', options);

        const currentMonth = new Date(indiaDate).getMonth() + 1;
        const currentYear = new Date(indiaDate).getFullYear();

        const startDate = new Date(`${currentYear}-${currentMonth}-01T00:00:00.000Z`);
        const endDate = new Date(new Date(currentYear, currentMonth, 0).setHours(23, 59, 59, 999));

        const currentMonthHolidays = await Holiday.find({
            holiday_date: { $gte: startDate, $lte: endDate },
        });

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            data: currentMonthHolidays,
        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

module.exports = {
    addHoliday,
    getAllHolidays,
    getHolidayById,
    updateHoliday,
    deleteHoliday,
    getCurrentMonthHolidays,
    getAllHolidaysEmployee
};