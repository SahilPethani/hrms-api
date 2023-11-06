const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const connectDB = require('./db.js');
const errorMiddleware = require('./errors/error.js');

// Body parsers
app.use(express.json({ extended: true }));

// Connect to the database
connectDB()
  .then(() => {
    // Serve static files
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'html', 'index.html'));
    });

    // Include your routes
    const userRoutes = require('./routes/userroutes.js');
    app.use('/api/v1', userRoutes);

    // Error handling middleware (should be placed after your routes)
    app.use(errorMiddleware);

    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err);
  });
