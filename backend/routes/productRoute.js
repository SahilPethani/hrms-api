const express = require('express')

const {
    getAllProducts,
    getProductDetails,
    createProduct,
    updateProduct,
    deleteProduct,
    creatProductReview,
    getAllReview,
    deleteReview,
    getAllSellerProducts,
    getProductCategoryDetails,
    getReviewUser
} = require('../controller/productController')

const {
    authenticateUser,
    authorizePermission
} = require('../middleware/auth')

const router = express.Router()

router
    .route("/product")
    .get(getAllProducts)

router
    .route("/seller/product")
    .get(authenticateUser, authorizePermission("seller"), getAllSellerProducts)

router.route("/seller/product/new")
    .post(authenticateUser, authorizePermission("seller"), createProduct)

router
    .route("/seller/product/:id")
    .put(authenticateUser, authorizePermission("seller"), updateProduct)
    .delete(authenticateUser, authorizePermission("seller"), deleteProduct)

router
    .route("/product/:id")
    .get(getProductDetails)

router
    .route("/productfindbcategory/:id")
    .get(getProductCategoryDetails)

router
    .route("/review")
    .put(authenticateUser, authorizePermission("user"), creatProductReview)

router
    .route("/review")
    .get(getAllReview)
    .delete(authenticateUser, authorizePermission("user"), deleteReview)

router
    .route("/user/review")
    .get(authenticateUser, authorizePermission("user"), getReviewUser)

module.exports = router