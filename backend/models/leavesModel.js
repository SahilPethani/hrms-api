const mongoose = require('mongoose');

const leavesSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  fromDate: {
    type: Date,
    required: true,
  },
  toDate: {
    type: Date,
    required: true,
  },
  reason: {
    type: String,
    enum: ['Casual Leave', 'Sick Leave', 'Marriage Leave', 'Privilege Leave', 'Maternity Leave'],
    required: true,
  },
  from_time: {
    type: String,
    default: "0:00"
  },
  to_time: {
    type: String,
    default: "0:00"
  },
  hours: {
    type: Number,
    default: 0
  },
  one_day_leave_type: {
    type: String,
    enum: ['Full Day', 'Pre Lunch half day', 'Post lunch Half day', 'hourly', '']
  },
  type: {
    type: String,
    enum: ['One Day', 'More Then One Day'],
    required: true,
  },
  status: {
    type: String,
    enum: ['Approved', 'Rejected', 'Pending'],
    default: 'Pending',
  },
  comments: {
    type: String,
  },
});

const Leaves = mongoose.model('Leaves', leavesSchema);

module.exports = Leaves;
