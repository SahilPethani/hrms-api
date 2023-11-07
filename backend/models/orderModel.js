const mongoose = require("mongoose")
const validator = require("validator")

const orderSchema = new mongoose.Schema({
    shippingInfo: {
        frist_name: {
            type: String,
            required: [true, "Please Enter Frist Name"],
            maxLength: [30, "Name Connot exceed 30 characters"],
            minLength: [2, "Name should have more than 2 characters"]
        },
        last_name: {
            type: String,
            required: [true, "Please Enter Frist Name"],
            maxLength: [30, "Name Connot exceed 30 characters"],
            minLength: [2, "Name should have more than 2 characters"]
        },
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        postal_code: {
            type: Number,
            required: true,
        },
        email: {
            type: String,
            required: [true, "Please Enter Your Email"],
            // unique: true,
            validate: [validator.isEmail, "Please Enter Your Email"]
        },
        phone_no: {
            type: Number,
            required: true,
        },
    },
    order_items: [
        {
            product_price: {
                type: Number,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            total_price: {
                type: Number,
                required: true,
            },
            seller: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true
            },
            status: {
                type: String,
                required: true,
                enum: ["Confirmed", "Pending", "Cancelled"],
                default: "Pending",
            },
            product: {
                type: mongoose.Schema.ObjectId,
                ref: "Product",
                required: true,
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    payment_info: {
        id: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
        },
    },
    paidAt: {
        type: Date,
        required: true,
    },
    items_price: {
        type: Number,
        required: true,
        default: 0,
    },
    tax_price: {
        type: Number,
        required: true,
        default: 0,
    },
    shipping_price: {
        type: Number,
        required: true,
        default: 0,
    },
    total_price: {
        type: Number,
        required: true,
        default: 0,
    },
    order_status: {
        type: String,
        required: true,
        enum: ["Delivered", "Confirmed", "Processing", "Cancelled"],
        default: "Processing",
    },
    deliveredAt: Date,
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model("Order", orderSchema)