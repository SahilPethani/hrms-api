const mongoose = require('mongoose');

const leavesSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  fromDate: {
    type: Date,
    required: true
  },
  toDate: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['Casual Leave', 'Sick Leave', 'Marriage Leave', 'Privilege Leave', 'Maternity Leave'],
    required: true
  },
  halfDay: {
    type: Boolean,
    default: false  // Default value is 'no' (0)
  },
  status: {
    type: String,
    enum: ['Approved', 'Rejected', 'Pending'],
    default: 'Pending'
  },
  comments: {
    type: String
  }
});

const Leaves = mongoose.model('Leaves', leavesSchema);

module.exports = Leaves;
