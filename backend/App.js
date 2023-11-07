const express = require('express')
const app = express()
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser");
const dotenv = require('dotenv')
var cors = require('cors')
const path = require("path");

const errorMiddleware = require("./errors/error")
dotenv.config({ path: "backend/config/config.env" })

app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cors())

// Route imports
const user = require("./routes/userRoute")

app.use("/api/v1", user)

app.get('/', (req, res) => {
  res.send('Hey this is my API running 🥳')
})

// Error
app.use(errorMiddleware)

module.exports = app