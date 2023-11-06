const app = require('./App')
const dotenv = require('dotenv')
const connectDatabase = require('./db')
dotenv.config({ path: "config/config.env" })

connectDatabase()

const server = app.listen(process.env.PORT, () => {
    console.log(`Server is working on ${process.env.PORT}`)
})

process.on("unhandledRejection", (err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to Unhandeled Promis Rejection`);
    server.close(()=>{
        process.exit(1);
    });
});