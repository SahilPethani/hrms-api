const mongoose = require("mongoose");

const HolidaySchema = new mongoose.Schema({
    holiday_no: { type: String, required: true },
    holiday_name: { type: String, required: true },
    holiday_date: { type: Date, required: true },
    detail: { type: String },
    status: {
        type: Number,
        required: true,
        enum: [
            0,
            1,
        ],
        default: 0
    },
});

const Holiday = mongoose.model("Holiday", HolidaySchema);

module.exports = Holiday;
