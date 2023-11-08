const mongoose = require('mongoose');
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
  first_name: { type: String },
  last_name: { type: String, },
  gender: { type: String, },
  mobile: { type: String, },
  password: { type: String, },
  designation: { type: String, },
  department: { type: String, },
  address: { type: String, },
  email: { type: String, },
  date_of_birth: { type: String, },
  education: { type: String, },
  join_date: { type: String, },
  avatar: { type: String, },
  status: { type: String,},
});

module.exports = mongoose.model('Employee', userSchema);