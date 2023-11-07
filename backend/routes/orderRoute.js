const express = require('express')
const { newOrder, getSingelOrder, getUserOrders, getOrderListForSeller, updateOrederProductStatus, getAllOrders, cancleOrderbyUser, getOrderLifetime, getSaleStatisticMonth, getSaleStatisticDay, getSaleStatisticWeek, getProductStates } = require('../controller/orderController')
const router = express.Router()

const {
    authenticateUser,
    authorizePermission
} = require('../middleware/auth')

// creta new order by user
router
    .route("/user/order/new")
    .post(authenticateUser, authorizePermission("user"), newOrder)

// get all order by perticuler user
router
    .route("/user/orders/:userId")
    .get(authenticateUser, authorizePermission("user"), getUserOrders)

// get all order by Admin
router
    .route("/admin/orders")
    .get(authenticateUser, authorizePermission("admin"), getAllOrders)

// get suingel order by user
router
    .route("/user/order/:id")
    .get(authenticateUser, authorizePermission("user"), getSingelOrder)

// order item status change by seller order 
router
    .route("/seller/orders/update-product-status-confirm/:itemId")
    .get(authenticateUser, authorizePermission("seller"), updateOrederProductStatus)

// get all order by seller order 
router
    .route("/seller/orders/:sellerId")
    .get(authenticateUser, authorizePermission("seller"), getOrderListForSeller)

// get order Lifetime Sale
router
    .route("/seller/lifetimesale/:sellerId")
    .get(authenticateUser, authorizePermission("seller"), getOrderLifetime)

// get order stats Sale
router
    .route("/seller/stats/:sellerId")
    .get(authenticateUser, authorizePermission("seller"), getProductStates)


// get sele statistic - monthly day week
router
    .route("/seller/sales/monthly/:sellerId")
    .get(authenticateUser, authorizePermission("seller"), getSaleStatisticMonth)

router
    .route("/seller/sales/daily/:sellerId")
    .get(authenticateUser, authorizePermission("seller"), getSaleStatisticDay)

router
    .route("/seller/sales/weekly/:sellerId")
    .get(authenticateUser, authorizePermission("seller"), getSaleStatisticWeek)

// cancle order by user 
router
    .route("/user/cancle-order/:orderId")
    .put(authenticateUser, authorizePermission("user"), cancleOrderbyUser)

module.exports = router