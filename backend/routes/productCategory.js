const express = require("express")

const {
    createProductCategory,
    getAllProductCategory,
    updateProductCategory,
    deleteProductCtegory,
    getOneProductCategory,
    addProductoncategory,
    removeProductoncategory
} = require('../controller/categoryController')

const {
    authenticateUser,
    authorizePermission
} = require('../middleware/auth')

const router = express.Router()

router
    .route("/category")
    .get(authenticateUser, getAllProductCategory)

router
    .route("/seller/category/new")
    .post(authenticateUser, authorizePermission("seller"), createProductCategory)

router
    .route("/seller/category/update-with-products/:categoryId")
    .put(authenticateUser, authorizePermission("seller"), addProductoncategory)

router
    .route("/seller/category/remove-products/:categoryId")
    .put(authenticateUser, authorizePermission("seller"), removeProductoncategory)


router
    .route("/seller/category/:id")
    .put(authenticateUser, authorizePermission("seller"), updateProductCategory)
    .get(authenticateUser, authorizePermission("seller"), getOneProductCategory)
    .delete(authenticateUser, authorizePermission("seller"), deleteProductCtegory)

module.exports = router