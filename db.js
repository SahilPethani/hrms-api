// const mongoose = require('mongoose');

// mongoose.connect('mongodb+srv://node-shop:node-shop@node-rest-shop.seyvw5c.mongodb.net/HRMS-codeline-api?retryWrites=true&w=majority')
//   .then(() => {
//     console.log('MongoDB connected successfully');
//   })
//   .catch((error) => {
//     console.error('MongoDB connection error:', error);
//   });


const mongoose = require("mongoose");

const connectDB = async () => {
  const conn = await mongoose.set("strictQuery", false).connect('mongodb+srv://node-shop:node-shop@node-rest-shop.seyvw5c.mongodb.net/HRMS-codeline-api?retryWrites=true&w=majority');
  console.log(`MONGODB CONNECTED : ${conn.connection.host}`);
}

module.exports = connectDB;