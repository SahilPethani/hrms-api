const mongoose = require("mongoose")

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter product Name"],
        unique: true,
    },
    description: {
        type: String,
        required: [true, "Please Enter product Description"],
    },
    short_description: {
        type: String,
    },
    price: {
        type: Number,
        required: [true, "Please Enter product Price"],
        maxLength: [8, "Price cannot exceed 8 characters"],
    },
    ratings: {
        type: Number,
        default: 0,
    },
    images: [
        {
          public_id: {
            type: String,
            required: true,
          },
          url: {
            type: String,
            required: true,
          },
        },
      ],
    category: {
        type: mongoose.Schema.ObjectId,
        ref: "Category",
    },
    stock: {
        type: Number,
        required: [true, "Please Enter product Stock"],
        maxLength: [4, "Stock cannot exceed 4 characters"],
        default: 1,
    },
    numOfReviews: {
        type: Number,
        default: 0,
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            rating: {
                type: Number,
                required: true,
            },
            comment: {
                type: String,
                required: true,
            },
        },
    ],
    status: {
        type: Number,
        required: true,
        enum: [
            0,
            1,
        ],
        default: 0
    },
    sku: {
        type: String
    },
    weight: {
        type: String,
    },
    visibility: {
        type: Number,
        required: true,
        enum: [
            0,
            1,
        ],
        default: 0
    },
    stock_availability: {
        type: Number,
        enum: [
            0,
            1
        ],
        default: 0

    },
    manage_stock: {
        type: Number,
        required: true,
        enum: [0, 1],
        default: 0
    },
    quantity: {
        type: Number,
        default: 1,
    },
    manufacturer_brand: {
        type: String,
        default: "",
    },
    discount: {
        type: Number,
        default: 0,
    },
    seller: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    url_key: {
        type: String,
        default: ""
    },
    meta_title
        : {
        type: String,
        default: ""
    },
    meta_keywords
        : {
        type: String,
        default: ""
    },
    meta_description
        : {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model("Product", productSchema)