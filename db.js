const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb+srv://node-shop:node-shop@node-rest-shop.seyvw5c.mongodb.net/HRMS-codeline-api?retryWrites=true&w=majority');

    console.log(`MONGODB CONNECTED: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
}

module.exports = connectDB;
