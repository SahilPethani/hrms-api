const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'Active'
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    freeShipping: {
        type: Boolean,
        default: false
    },
    allowedUsers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    allowedEmails: [
        String
    ],
    minPurchaseAmount: {
        type: Number,
        default: 0
    },
});

module.exports = mongoose.model('Coupon', couponSchema);
