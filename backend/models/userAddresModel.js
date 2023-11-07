const mongoose = require("mongoose")
const validator = require("validator")

const addressSchema = mongoose.Schema({
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
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
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
        unique: true,
        validate: [validator.isEmail, "Please Enter Your Email"]
    },
    phone_no: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model("Address", addressSchema)