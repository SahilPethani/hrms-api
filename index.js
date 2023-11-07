// const app = require('./App')
// const dotenv = require('dotenv')
// const connectDatabase = require('./db')
// dotenv.config({ path: "config/config.env" })

// connectDatabase()

// const server = app.listen(process.env.PORT, () => {
//     console.log(`Server is working on ${process.env.PORT}`)
// })

// process.on("unhandledRejection", (err)=>{
//     console.log(`Error: ${err.message}`);
//     console.log(`Shutting down the server due to Unhandeled Promis Rejection`);
//     server.close(()=>{
//         process.exit(1);
//     });
// });


const express = require('express')
var cors = require('cors')
const mongoose = require("mongoose")
mongoose.set('strictQuery', true);
const app = express()

mongoose.connect("mongodb+srv://node-shop:node-shop@node-rest-shop.seyvw5c.mongodb.net/HRMS-codeline-api?retryWrites=true&w=majority").then(() => {
    console.log("Connection is Successful")
}).catch((err) => console.log(`Somthing wont wrong`))

// const connectDatabase = require('./db.js')

app.use(express.json())
app.use(cors())

// connectDatabase()

const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
    console.log(`API listening on PORT ${PORT} `)
})

const userRoutes = require('./routes/userroutes.js');
app.use('/api/v1', userRoutes);

app.get('/', (req, res) => {
    res.send('Hey this is my API running 🥳')
})
// app.get('/about', (req, res) => {
//     res.send('This is my about route..... ')
// })

// Export the Express API
module.exports = app