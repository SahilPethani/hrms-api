const catchAsyncErrors = require("../errors/catchAsyncErrors");
const StoreInfo = require("../models/storeInfoModel");
const User = require("../models/userModel");
const { StatusCodes } = require("http-status-codes");
const ErrorHander = require("../middleware/errorhander");


const getStoreInfo = catchAsyncErrors(async (req, res, next) => {
    const userId = req.params.userId;
    const storeInfo = await StoreInfo.find({
        'user': userId
    });

    const combinedStoreInfo = storeInfo.reduce((combined, current) => {
        return {
            ...combined,
            ...current.toObject()
        };
    }, {});

    res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        success: true,
        data: combinedStoreInfo,
    })
})

const updateStoreInfo = catchAsyncErrors(async (req, res, next) => {
    const userId = req.params.userId;
    const updatedInfo = req.body; // Assuming the updated info is sent in the request body

    // Update the storInfo for the user
    const updatedStoreInfo = await StoreInfo.findOneAndUpdate(
        { user: userId },
        updatedInfo,
        { new: true }
    );

    if (!updatedStoreInfo) {
        return res.status(StatusCodes.NOT_FOUND).json({
            status: StatusCodes.NOT_FOUND,
            success: false,
            message: 'StoreInfo not found for the user'
        });
    }

    res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        success: true,
        message: 'StoreInfo Updated successfully'
    })
})

module.exports = {
    getStoreInfo,
    updateStoreInfo
};