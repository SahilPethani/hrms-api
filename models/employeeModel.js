const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  email: { type: String, unique: true, required: true },
  role: {
    type: String,
    enum: ['admin', 'employee'],
    required: true,
  },
});

module.exports = mongoose.model('Employee', employeeSchema);
