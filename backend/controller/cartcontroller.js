const catchAsyncErrors = require("../errors/catchAsyncErrors");
const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const { StatusCodes } = require("http-status-codes");
const Product = require("../models/productModel");
const ErrorHander = require("../middleware/errorhander");

// add data in cart
const addToCart = catchAsyncErrors(async (req, res, next) => {
    const { productId, item_quantity, userId } = req.body;

    const user = await User.findById(userId);
    const product = await Product.findById(productId);

    if (!user || !product) {
        return next(new ErrorHander("User or Product not found.", 404))
    }
    const cart = await Cart.findOne({ user: userId, product: productId });

    // const lessquantity = product?.stock - cart?.item_quantity
    // if (item_quantity > product?.stock) {
    //     return next(new ErrorHander(`you have add only ${lessquantity} Quantity`, 404))
    // }

    if (item_quantity > product?.stock) {
        return next(new ErrorHander(`We're sorry! Only ${product?.stock} unit(s) allowed in each order`, 400))
    }

    // const quantity = cart?.item_quantity + item_quantity
    // if (quantity > product?.stock) {
    //     return next(new ErrorHander(`you have already added max Quantity ${product?.stock} in this product`, 404))
    // }

    if (cart) {
        // If the product is already in the cart, update the quantity
        cart.item_quantity = item_quantity;
        cart.total_price = product?.price * item_quantity;
        await cart.save();
    } else {
        // If the product is not in the cart, create a new cart item
        await Cart.create({
            item_quantity: item_quantity,
            total_price: product?.price * item_quantity,
            user: userId,
            product: productId,
        });
    }
    res.status(StatusCodes.CREATED).json({
        status: StatusCodes.CREATED,
        success: true,
        message: "Product added to cart successfully."
    })
})

// get data for perticuler user
const getUserCartDetail = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    // Find the total count of cart items for the given userId (for pagination)
    const totalCount = await Cart.countDocuments({ user: userId });

    const cartItems = await Cart.find({ user: userId })
        .populate('product')
        .skip(skip)
        .limit(limit);

    res.status(StatusCodes.OK).json({
        data: cartItems,
        status: StatusCodes.OK,
        success: true,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
    });
})

// remove item for cart
const removeUserCartitem = catchAsyncErrors(async (req, res, next) => {
    const { userId, itemId } = req.params;

    const cartItem = await Cart.findOne({ _id: itemId, user: userId });

    if (!cartItem) {
        return next(new ErrorHander(`Cart item not found.`, 404))
    }

    await cartItem.remove();
    res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        success: true,
        message: "Cart item removed successfully"
    })
})

module.exports = {
    addToCart,
    getUserCartDetail,
    removeUserCartitem
};