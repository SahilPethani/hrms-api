const ErrorHander = require("../middleware/errorhander")
const catchAsyncErrors = require("../errors/catchAsyncErrors")
const User = require("../models/userModel");
const { StatusCodes } = require("http-status-codes");
const productModel = require("../models/productModel");
const orderModel = require("../models/orderModel");
const productCategory = require("../models/categoryModel");

const getAllCountData = catchAsyncErrors(async (req, res, next) => {
    const users = await User.countDocuments({ role: "user" });
    const sellers = await User.countDocuments({ role: "seller" });
    const products = await productModel.countDocuments();
    const orders = await orderModel.countDocuments();
    const categorys = await productCategory.countDocuments();

    res.status(StatusCodes.OK).json({
        success: true,
        status: StatusCodes.OK,
        users,
        sellers,
        products,
        orders,
        categorys
    })
})

module.exports = {
    getAllCountData
}