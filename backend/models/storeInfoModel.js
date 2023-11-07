const mongoose = require("mongoose")

const storInfoSchema = mongoose.Schema({
    store_name: {
        type: String,
        default: "",
    },
    store_description: {
        type: String,
        default: "",
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    time_zone: {
        type: String,
        default: "",
    },
    store_phone_number: {
        type: Number,
        default: 0,
    },
    store_email: {
        type: String,
        default: "",
    },
    country: {
        type: String,
        default: "",
    },
    address: {
        type: String,
        default: "",
    },
    city: {
        type: String,
        default: "",
    },
    province: {
        type: String,
        default: "",
    },
    postalCode: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model("storInfo", storInfoSchema)