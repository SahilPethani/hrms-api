const express = require('express')
const app = express()
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser");
const fileUpload = require('express-fileupload')
const dotenv = require('dotenv')
var cors = require('cors')
const cloudinary = require('cloudinary').v2;
const path = require("path");

const errorMiddleware = require("./errors/error")
dotenv.config({ path: "backend/config/config.env" })

app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload())
app.set("view engine", "ejs");
app.use(cors())

cloudinary.config({
  cloud_name: 'dx7dw1xbr',
  api_key: '338876934159545',
  api_secret: 'm4yF9StnM4XG-LdCQAM2Wz79QXE'
});

// Route imports
const product = require("./routes/productRoute")
const productCategory = require("./routes/productCategory")
const user = require("./routes/userRoute")
const order = require("./routes/orderRoute")
const payment = require("./routes/paymentRoute")
const commen = require("./routes/commenDataRoute")
const cart = require("./routes/cartRoute")
const userAddress = require("./routes/userAddressRoute")
const storInfo = require("./routes/storeInfoRoute")

app.use("/api/v1", product)
app.use("/api/v1", user)
app.use("/api/v1", order)
app.use("/api/v1", productCategory)
app.use("/api/v1", payment)
app.use("/api/v1", commen)
app.use("/api/v1", cart)
app.use("/api/v1", userAddress)
app.use("/api/v1", storInfo)

app.get('/', (req, res) => {
  res.send('Hey this is my API running 🥳')
})

// Error
app.use(errorMiddleware)

module.exports = app