// server.js
const express = require('express');
const serverless = require('serverless-http');
const app = express();
const dotenv = require('dotenv');
const connectDatabase = require('./database');
dotenv.config({ path: "backend/config/config.env" });
require('./utils/cronJobs');

// Your existing routes and middleware
app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

// Start the server for local development
if (process.env.NODE_ENV !== 'production') {
  const server = app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is working on http://localhost:${process.env.PORT || 3000}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.log(`Error: ${err.message}`);
    console.log('Shutting down the server due to Unhandled Promise Rejection');
    server.close(() => {
      process.exit(1);
    });
  });
}

// Export the app for Netlify serverless deployment
module.exports.handler = serverless(app);
