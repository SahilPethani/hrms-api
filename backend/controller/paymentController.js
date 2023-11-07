const ErrorHander = require("../middleware/errorhander")
const catchAsyncErrors = require("../errors/catchAsyncErrors")
const { StatusCodes } = require("http-status-codes");

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

exports.processPayment = catchAsyncErrors(async (req, res, next) => {
    const myPayment = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: "inr",
        metadata: {
            company: "Ecommerce",
        }
        // automatic_payment_methods: {
        //     enabled: true
        // }
    })
    res.status(StatusCodes.OK).json({ success: true, client_secret: myPayment.client_secret })
})

exports.sendStripeApiKey = catchAsyncErrors(async (req, res, next) => {
    res.status(StatusCodes.OK).json({ stripeApiKey: process.env.STRIPE_API_KEY })
})