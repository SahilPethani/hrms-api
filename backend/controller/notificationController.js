const admin = require('firebase-admin');
const User = require("../models/userModel");
const ErrorHandler = require("../middleware/errorhander");

// Firebase Admin SDK setup
const serviceAccount = require('../serviceAccountKey.json');
const { StatusCodes } = require('http-status-codes');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});


const sendNotification = async (req, res, next) => {
    try {
        const { user_id, title, body } = req.body;
        if (!user_id || !title) {
            return next(new ErrorHandler("All fields are required for login", StatusCodes.BAD_REQUEST));
        }

        const user = await User.findOne({ user_id });

        if (!user) {
            return next(new ErrorHandler(`Employee not found with id ${employeeId}`, StatusCodes.NOT_FOUND));
        }

        // Send notification using FCM token
        const message = {
            token: user.fcmToken,
            notification: {
                title: title,
                body: body,
            },
        };

        const response = await admin.messaging().send(message);
        return res.status(StatusCodes.OK).json({
            status: StatusCodes.OK,
            success: true,
            message: "Notification sent successfully.",

        });
    } catch (error) {
        return next(new ErrorHandler(error, StatusCodes.INTERNAL_SERVER_ERROR));

    }
}


module.exports = {
    sendNotification
};
