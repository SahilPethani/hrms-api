const mongoose = require("mongoose");

const PunchSchema = new mongoose.Schema({
    type: { type: String, enum: ["punchIn", "punchOut"], required: true },
    punchIn: { type: Date },
    punchOut: { type: Date },
    note: { type: String },
});

const AttendanceDetailSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    present: { type: Number, enum: [0, 1], required: true },
    date: { type: Date, default: Date.now },
    punches: [PunchSchema],
});

const AttendanceSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    attendanceDetails: [AttendanceDetailSchema],
});

const Attendance = mongoose.model("Attendance", AttendanceSchema);

module.exports = Attendance;
