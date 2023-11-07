const mongoose = require("mongoose")

const cartSchema = mongoose.Schema({
    item_quantity: {
        type: Number,
        required: true,
        default: 1
    },
    total_price: {
        type: Number,
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
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
})

module.exports = mongoose.model("Cart", cartSchema)