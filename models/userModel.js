const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true, trim: true },
  password: { type: String, required: true },
  email: { type: String, unique: true, required: true, trim: true },
  role: {
    type: String,
    enum: ['admin', 'employee'],
    required: true,
  },
});

module.exports = mongoose.model('User', userSchema);
