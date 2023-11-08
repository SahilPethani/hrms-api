const express = require('express')
const app = express()
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser");
const dotenv = require('dotenv')
var cors = require('cors')
const path = require("path");

const allowedOrigins = ['https://hrms-api-six.vercel.app/'];

// Use the cors middleware to allow requests from specific origins
app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: 'GET,POST,PUT,DELETE', // Specify the allowed HTTP methods
        allowedHeaders: 'Content-Type,Authorization', // Specify the allowed headers
    })
);



const errorMiddleware = require("./errors/error")
dotenv.config({ path: "backend/config/config.env" })

app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cors())

const absoluteUploadsPath = path.join(__dirname, '..', 'uploads');

// Serve files from the "uploads" folder
app.use('/uploads', express.static(absoluteUploadsPath));

// Route imports
const user = require("./routes/userRoute")
const employee = require("./routes/employeeRoute");
const upload = require('./middleware/multerConfig');

app.use(upload.single('avatar'));
app.use("/api/v1", user)
app.use("/api/v1", employee)

app.get('/', (req, res) => {
  res.send('Hey this is my API running 🥳')
})

// Error
app.use(errorMiddleware)

module.exports = app