const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  email: { type: String, unique: true, required: true },
  role: {
    type: String,
    enum: ['admin', 'employee'],
    required: true,
  },
});

module.exports = mongoose.model('User', userSchema);
