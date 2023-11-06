const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const connectDB = require('./db');
const errorMiddleware = require("./errors/error")

app.use(express.json());
app.use(express.json({}));
app.use(express.json({ extended: true }));

connectDB()
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

// Include your routes
const user = require("./routes/userroutes")

app.use("/api/v1", user)

// app.use('/auth', require('./auth'));
app.use(errorMiddleware)

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
