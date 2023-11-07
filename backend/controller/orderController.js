const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHander = require("../middleware/errorhander")
const catchAsyncErrors = require("../errors/catchAsyncErrors")
const { StatusCodes } = require("http-status-codes");
const mongoose = require('mongoose');
const cron = require('node-cron');

// create new order -- user
const newOrder = catchAsyncErrors(async (req, res, next) => {
    req.body.paidAt = Date.now()

    var items_price = 0
    for (var i in req.body.order_items) {
        req.body.order_items[i].total_price = req.body.order_items[i].product_price * req.body.order_items[i].quantity;
        items_price += req.body.order_items[i].total_price
    }

    req.body.items_price = items_price

    const orders = await Order.create(req.body);
    res.status(StatusCodes.CREATED).json({
        status: StatusCodes.CREATED,
        success: true,
        message: "Order placed successfully"
    });
});

// get singelOrder 
const getSingelOrder = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.findById(req.params.id).populate("user", "name email")
    if (!orders) {
        return next(new ErrorHander("Order not found with this id", 404))
    }
    res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        success: true,
        data: orders
    })
})

// get logedin user orders
const getUserOrders = catchAsyncErrors(async (req, res, next) => {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await Order.countDocuments({ user: userId });

    const orders = await Order.find({ user: userId }).populate('order_items.product')
        .skip(skip)
        .limit(limit);
    if (!orders) {
        return next(new ErrorHander("Order not found with this id", 404))
    }
    res.status(StatusCodes.OK).json({
        data: orders,
        status: StatusCodes.OK,
        success: true,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
    });
});

// get all orders = seller
const getOrderListForSeller = catchAsyncErrors(async (req, res, next) => {

    const { sellerId } = req.params;

    const orders = await Order.find({
        'order_items.seller': mongoose.Types.ObjectId(sellerId) // Convert string to ObjectId
    }).exec();

    const sellerOrders = orders.map(order => {
        const filteredItems = order.order_items.filter(item => item.seller.toString() === sellerId);
        return { ...order._doc, order_items: filteredItems };
    });

    res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        success: true,
        data: sellerOrders,
        totalCount: sellerOrders.length
    });
})

// get all order for Admin
const getAllOrders = catchAsyncErrors(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await Order.countDocuments();

    const orders = await Order.find().populate('order_items.product')
        .populate('user')
        .skip(skip)
        .limit(limit);

    res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        success: true,
        data: orders,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
    });
})

// get seller order and update order status -- to confirm
const updateOrederProductStatus = catchAsyncErrors(async (req, res, next) => {
    const itemId = req.params.itemId;

    const order = await Order.findOne({ 'order_items._id': itemId });
    if (!order) {
        return next(new ErrorHander('Order not found', 404))
    }

    const orderedProduct = order.order_items.find(item => item._id.toString() === itemId);
    if (!orderedProduct) {
        return next(new ErrorHander('Ordered product not found', 404))
    }

    if (orderedProduct.status === "Confirmed") {
        return next(new ErrorHander('Product Satus already confirmd', 404))
    }

    if (orderedProduct.status === "Cancelled") {
        return next(new ErrorHander('Product Satus Cancelled do not change status', 404))
    }

    orderedProduct.status = "Confirmed";
    await order.save();

    const product = await Product.findById(orderedProduct.product);
    product.stock -= orderedProduct.quantity;
    await product.save();

    res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        success: true,
        message: 'Order item status updated successfully',
        data: orderedProduct
    });
})


// order cancle by user 
const cancleOrderbyUser = catchAsyncErrors(async (req, res, next) => {
    const orderId = req.params.orderId;

    // Find the order by its ID
    const order = await Order.findById(orderId);

    if (!order) {
        return next(new ErrorHander('Order not found', 404))
    }

    if (order.order_status === "Cancelled") {
        return next(new ErrorHander('Order already Cancelled', 404))
    }

    for (const item of order.order_items) {
        item.status = 'Cancelled';
    }

    order.order_status = 'Cancelled';
    await order.save();

    for (var i in order.order_items) {
        if (order.order_items[i].status === 'Confirmed') {
            const product = await Product.findById(order.order_items[i].product);
            product.stock += order.order_items[i].quantity;
            await product.save({ validateBeforeSave: false });
        }
    }

    res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        success: true,
        message: 'Order cancelled successfully',
        data: order
    });
})

// change status for item product in 3 day left
// Schedule task to run every hour
cron.schedule('0 * * * *', async () => {
    const orders = await Order.find({ 'order_items.status': 'Pending' });
    const currentTime = new Date();
    const cancellationThreshold = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds

    for (const order of orders) {
        for (const item of order.order_items) {
            if (item.status === 'Pending') {
                const creationTime = item.createdAt;
                if (currentTime - creationTime >= cancellationThreshold) {
                    item.status = 'Cancelled';
                }
            }
        }

        // if (order.order_items.some(item => item.status === 'Confirmed')) {
        //     order.order_status = 'Confirmed';
        // } else {
        //     order.order_status = 'Cancelled';
        // }

        await order.save();
    }
});


// get order Lifetime Sale - seller
const getOrderLifetime = catchAsyncErrors(async (req, res, next) => {
    const sellerId = req.params.sellerId;

    // Find all orders where the seller's ID matches
    const lifetimeSales = await Order.aggregate([
        { $match: { 'order_items.seller': sellerId } },
        { $group: { _id: null, totalSales: { $sum: '$total_price' } } }
    ]);

    const totalOrders = await Order.countDocuments({ 'order_items.seller': sellerId });

    const completedOrders = await Order.countDocuments({
        'order_items.seller': sellerId,
        order_status: 'Delivered'
    });

    // Get the number of cancelled orders for the seller
    const cancelledOrders = await Order.countDocuments({
        'order_items.seller': sellerId,
        order_status: 'Cancelled'
    });

    const totalSales = lifetimeSales.length > 0 ? lifetimeSales[0].totalSales : 0;
    const completedPercentage = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
    const cancelledPercentage = totalOrders > 0 ? (cancelledOrders / totalOrders) * 100 : 0;

    res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        success: true,
        lifetimeSales: totalSales,
        totalOrders: totalOrders,
        completedPercentage: completedPercentage.toFixed(2),
        cancelledPercentage: cancelledPercentage.toFixed(2)
    });
})

// Sale Statistic graf detail monthly - dayly - weekly seller
const getSaleStatisticMonth = catchAsyncErrors(async (req, res, next) => {
    const sellerId = req.params.sellerId;

    // Find orders where the seller's ID matches
    const orders = await Order.find({
        'order_items.seller': sellerId
    });

    // Initialize an array to hold monthly sales data
    const monthlySales = Array(12).fill(0);

    orders.forEach(order => {
        const month = order.createdAt.getMonth();
        monthlySales[month] += order.total_price;
    });

    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        success: true,
        labels: monthNames,
        data: monthlySales
    });
})

const getSaleStatisticDay = catchAsyncErrors(async (req, res, next) => {
    const sellerId = req.params.sellerId;

    // Find orders where the seller's ID matches
    const orders = await Order.find({
        'order_items.seller': sellerId
    });

    const dailySales = new Array(31).fill(0); // Assuming max days in a month is 31

    // Calculate daily sales
    orders.forEach(order => {
        const day = order.createdAt.getDate();
        dailySales[day - 1] += order.total_price;
    });

    const labels = dailySales.map((_, index) => {
        const date = new Date();
        date.setDate(index + 1);
        return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate().toString().padStart(2, '0')}`;
    });

    res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        success: true,
        labels,
        data: dailySales
    });
})

const getSaleStatisticWeek = catchAsyncErrors(async (req, res, next) => {
    const sellerId = req.params.sellerId;

    // Find orders where the seller's ID matches
    const orders = await Order.find({
        'order_items.seller': sellerId
    });

    const weeklySales = new Array(4).fill(0); // Assuming max weeks in a month is 4

    // Calculate weekly sales
    orders.forEach(order => {
        const week = Math.floor(order.createdAt.getDate() / 7);
        weeklySales[week] += order.total_price;
    });

    const labels = weeklySales.map((_, index) => `Week ${index + 1}`);

    res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        success: true,
        labels,
        data: weeklySales
    });
})

// get ordered product state - seller
const getProductStates = catchAsyncErrors(async (req, res, next) => {
    const sellerId = req.params.sellerId;

    const completedOrders = await Order.find({
        'order_items.seller': sellerId,
        order_status: 'Delivered'
    });

    const productStats = {};

    completedOrders.forEach(order => {
        order.order_items.forEach(item => {
            if (item.seller.toString() === sellerId) {
                const productId = item.product.toString();

                if (!productStats[productId]) {
                    productStats[productId] = {
                        product: null,
                        totalQuantity: 0,
                        totalPrice: 0
                    };
                }

                productStats[productId].totalQuantity += item.quantity;
                productStats[productId].totalPrice += item.total_price;
            }
        });
    });

    for (const productId in productStats) {
        const productInfo = await Product.findById(productId);
        productStats[productId].product = productInfo;
    }

    //Format the response as an array
    const response = Object.values(productStats);

    res.status(StatusCodes.OK).json({
        status: StatusCodes.OK,
        success: true,
        data: response
    });
});

module.exports = {
    newOrder,
    getSingelOrder,
    getUserOrders,
    getOrderListForSeller,
    updateOrederProductStatus,
    getAllOrders,
    cancleOrderbyUser,
    getOrderLifetime,
    getSaleStatisticMonth,
    getSaleStatisticDay,
    getSaleStatisticWeek,
    getProductStates
}