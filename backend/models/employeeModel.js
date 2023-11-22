const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const PunchSchema = new mongoose.Schema({
  type: { type: String, enum: ["punchIn", "punchOut"], required: true },
  punchIn: { type: Date },
  punchOut: { type: Date },
  note: { type: String },
});

const AttendanceSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  present: { type: Number, enum: [0, 1], required: true },
  punches: [PunchSchema],
});

const userSchema = new mongoose.Schema({
  user_id: { type: String, unique: true, required: true },
  first_name: {
    type: String,
    required: [true, "Please Enter Name"],
    unique: true,
    maxLength: [30, "Name Cannot exceed 30 characters"],
    minLength: [2, "Name should have more than 2 characters"]
  },
  last_name: {
    type: String,
    required: [true, 'Please enter last name']
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
    unique: true,
    validate: [validator.isEmail, "Please Enter Email"]
  },
  date_of_birth: {
    type: String,
    required: [true, 'Please enter your date of birth']
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
    type: String,
    required: true,
  },
  create_user: {
    type: Number,
    required: true,
    enum: [
      0,
      1,
    ],
    default: 0
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
  attendances: [AttendanceSchema],
});

// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) {
//     return next();
//   }
//   this.password = await bcrypt.hash(this.password, 10);
// });

module.exports = mongoose.model('Employee', userSchema);
