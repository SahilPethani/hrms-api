const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, "Please Enter Name"],
    unique: true,
    maxLength: [30, "Name Connot exceed 30 characters"],
    minLength: [2, "Name should have more than 2 characters"]
  },
  last_name: {
    type: String,
    required: [true, 'Please enter  last name']
  },
  gender: {
    type: Number,
    required: true,
    enum: [
      0,
      1,
    ],
    default: 0
  },
  mobile: {
    type: String
  },
  password: {
    type: String,
    required: [true, "Please Enter Password"],
    minLength: [5, "Name should have more than 5 characters"],
    select: false
  },
  designation: {
    type: String,
    required: true,
  },
  address: {
    type: String
  },
  email: {
    type: String,
    required: [true, "Please Enter Email"],
    unique: true,
    validate: [validator.isEmail, "Please Enter Email"]
  },
  date_of_birth: {
    type: String
  },
  education: {
    type: String,
    required: [true, 'Please enter your education']
  },
  join_date: {
    type: String,
    required: [true, 'Please enter your join date']
  },
  avatar: {
    type: String
  },
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

// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) {
//     return next();
//   }
//   this.password = await bcrypt.hash(this.password, 10);
// });

module.exports = mongoose.model('Employee', userSchema);
