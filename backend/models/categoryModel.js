const mongoose = require("mongoose")

const productCategorySchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter Category name"],
        unique: true,
    },
    description: {
        type: String,
        required: [true, "Please Enter Description"],
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true 
    },
    category_banner: {
        type: String,
    },
    status: {
        type: Number,
        required: true,
        enum: [
            0,
            1,
        ],
        default: 0
    },
    include_in_store_menu: {
        type: Number,
        required: true,
        enum: [
            0,
            1,
        ],
        default: 1
    },
    parent_category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    url_key: {
        type: String,
        default: ""
    },
    meta_title: {
        type: String,
        default: ""
    },
    meta_keywords: {
        type: String,
        default: ""
    },
    meta_description: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model("Category", productCategorySchema)