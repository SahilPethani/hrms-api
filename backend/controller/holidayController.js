const { StatusCodes } = require("http-status-codes");
const ErrorHander = require("../middleware/errorhander");

const Holiday = require("../models/holidayModel");
const { addPunchForHoliday } = require("./punchController");

const addHoliday = async (req, res, next) => {
    try {
        const { holiday_no, holiday_name, holiday_date, detail, status } = req.body;

        if (!holiday_no || !holiday_name || !holiday_date) {
            return next(new ErrorHander("Holiday number, name, and date are required", StatusCodes.BAD_REQUEST));
        }

        const today = new Date();
        const selectedDate = new Date(holiday_date);

        if (selectedDate <= today) {
            return next(new ErrorHander("Invalid date. Holidays must be set for future dates only.", StatusCodes.BAD_REQUEST));
        }

        const isSunday = selectedDate.getDay() === 0;
        if (isSunday) {
            return next(new ErrorHander("Holidays cannot be added on Sundays", StatusCodes.BAD_REQUEST));
        }

        // Convert the holiday_date to the desired format
        const formattedHolidayDate = selectedDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });

        const holiday = new Holiday({
            holiday_no,
            holiday_name,
            holiday_date: formattedHolidayDate, // Use the formatted date
            detail,
            status
        });

        const savedHoliday = await holiday.save();
        addPunchForHoliday(formattedHolidayDate)
        return res.status(StatusCodes.CREATED).json({
            status: StatusCodes.CREATED,
            success: true,
            message: "Holiday created successfully",
            data: savedHoliday,
        });
    } catch (error) {
        return next(new ErrorHander(error, StatusCodes.INTERNAL_SERVER_ERROR));
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
        return next(new ErrorHander(error, StatusCodes.INTERNAL_SERVER_ERROR));
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
        return next(new ErrorHander(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};



const getHolidayById = async (req, res, next) => {
    try {
        const holidayId = req.params.id;
        const holiday = await Holiday.findById(holidayId);

        if (!holiday) {
            return next(new ErrorHander(`Holiday not found with id ${holidayId}`, StatusCodes.NOT_FOUND));
        }

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            data: holiday,
        });
    } catch (error) {
        return next(new ErrorHander(error, StatusCodes.INTERNAL_SERVER_ERROR));
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
            return next(new ErrorHander(`Holiday not found with id ${holidayId}`, StatusCodes.NOT_FOUND));
        }

        const isSunday = new Date(holiday_date).getDay() === 0;
        if (isSunday) {
            return next(new ErrorHander("Holidays cannot be updated on Sundays", StatusCodes.BAD_REQUEST));
        }

        const today = new Date();
        const selectedDate = new Date(holiday_date);

        if (selectedDate <= today) {
            return next(new ErrorHander("Invalid date. Holidays must be set for future dates only.", StatusCodes.BAD_REQUEST));
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
        return next(new ErrorHander(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};

const deleteHoliday = async (req, res, next) => {
    try {
        const holidayId = req.params.id;

        const existingHoliday = await Holiday.findById(holidayId);

        if (!existingHoliday) {
            return next(new ErrorHander(`Holiday not found with id ${holidayId}`, StatusCodes.NOT_FOUND));
        }

        const deletedHoliday = await Holiday.findByIdAndDelete(holidayId);

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: "Holiday deleted successfully",
            data: deletedHoliday,
        });
    } catch (error) {
        return next(new ErrorHander(error, StatusCodes.INTERNAL_SERVER_ERROR));
    }
};


const getCurrentMonthHolidays = async (req, res, next) => {
    try {
        // Get the current date and time in India timezone
        const options = { timeZone: 'Asia/Kolkata' };
        const indiaDate = new Date().toLocaleString('en-US', options);

        // Extract the current month and year
        const currentMonth = new Date(indiaDate).getMonth() + 1; // Note: Months are zero-indexed
        const currentYear = new Date(indiaDate).getFullYear();

        // Set the start and end date for the current month
        const startDate = new Date(`${currentYear}-${currentMonth}-01T00:00:00.000Z`);
        const endDate = new Date(new Date(currentYear, currentMonth, 0).setHours(23, 59, 59, 999));

        // Query holidays within the current month
        const currentMonthHolidays = await Holiday.find({
            holiday_date: { $gte: startDate, $lte: endDate },
        });

        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            data: currentMonthHolidays,
        });
    } catch (error) {
        return next(new ErrorHander(error, StatusCodes.INTERNAL_SERVER_ERROR));
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