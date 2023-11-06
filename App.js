const express = require('express');
const bodyParser = require('body-parser');
// const path = require('path');
const app = express();
const errorMiddleware = require("./errors/error.js")

const dotenv = require('dotenv')
var cors = require('cors')

dotenv.config({ path: "config/config.env" })

app.use(express.json())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())

// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const userRoutes = require('./routes/userroutes.js');
app.use('/api/v1', userRoutes);

// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'html', 'index.html'));
//   });

app.get('/', (req, res) => {
  res.send('<h1>Working Fine</h1>')
})

app.use(errorMiddleware);

module.exports = app