const express = require('express');
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const dotenv = require('dotenv');
const cors = require('cors');

const errorMiddleware = require("./errors/error");
dotenv.config({ path: "backend/config/config.env" });

app.use(cors())
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Route imports
const user = require("./routes/userRoute");
const employee = require("./routes/employeeRoute");
const dashbord = require("./routes/dashbordRoute");
const attendance = require("./routes/attendanceRoute");
const holiday = require("./routes/holidayRoute");

app.use("/api/v1", user);
app.use("/api/v1", dashbord);
app.use("/api/v1", employee);
app.use("/api/v1", attendance);
app.use("/api/v1", holiday);

app.get('/', (req, res) => {
  res.send('Hey, this is my API running 🥳');
});

// Error
app.use(errorMiddleware);

module.exports = app;
