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
const app = express()
const PORT = 4000
app.listen(PORT, () => {
console.log(`API listening on PORT ${PORT} `)
})
app.get('/', (req, res) => {
res.send('Hey this is my API running 🥳')
})
app.get('/about', (req, res) => {
res.send('This is my about route..... ')
})
// Export the Express API
module.exports = app