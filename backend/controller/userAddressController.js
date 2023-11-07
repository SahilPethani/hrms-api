const catchAsyncErrors = require("../errors/catchAsyncErrors")
const Product = require("../models/productModel")
const { StatusCodes } = require("http-status-codes");
const ApiFeatures = require("../utils/apifeatures")
const ErrorHander = require("../middleware/errorhander");
const userModel = require("../models/userModel");
const userAddress = require("../models/userAddresModel");


const createAddress = catchAsyncErrors(async (req, res, next) => {
    const address = await userAddress.create(req.body)
    res.status(StatusCodes.CREATED).json({
        status: StatusCodes.CREATED,
        success: true,
        message: "Address created successfully"
    })
})

const getAddressDetails = catchAsyncErrors(async (req, res, next) => {
    const { Id } = req.params;
    let address = await userAddress.findById(Id)
    if (!address) {
        return next(new ErrorHander("Address not found", 404))
    }
    res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        success: true,
        data: address,
    })
})

const updateAddressDetails = catchAsyncErrors(async (req, res, next) => {
    let address = await userAddress.findById(req.params.id)
    if (!address) {
        return next(new ErrorHander("Address not found", 404))
    }
    address = await userAddress.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });
    res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        success: true,
        message: "Address Updated successfully"
    })
})

const deleteAddress = catchAsyncErrors(async (req, res, next) => {
    const address = await userAddress.findById(req.params.id)
    if (!address) {
        return next(new ErrorHander("Address not found", 404))
    }
    await address.remove();
    res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        success: true,
        message: "Address deleted successfully"
    })
})

const getUserAddress = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.params;
    const address = await userAddress.find({ user: userId })

    if (!address) {
        return next(new ErrorHander("Address not found", 404))
    }

    res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        success: true,
        data: address
    })
})

const getAllAddress = catchAsyncErrors(async (req, res, next) => {
    const address = await userAddress.find()

    if (!address) {
        return next(new ErrorHander("Address not found", 404))
    }

    res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        success: true,
        data: address
    })
})

module.exports = {
    createAddress,
    getAddressDetails,
    updateAddressDetails,
    deleteAddress,
    getUserAddress,
    getAllAddress
}