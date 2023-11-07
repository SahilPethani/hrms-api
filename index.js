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
const bodyParser = require('body-parser');
var cors = require('cors')
const errorMiddleware = require("./errors/error.js")
const app = express()

const connectDatabase = require('./db')

app.use(express.json())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())

connectDatabase()

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
app.use(errorMiddleware);

// Export the Express API
module.exports = app