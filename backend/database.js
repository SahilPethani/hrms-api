// create a new review or update the review
const mongoose = require("mongoose")
mongoose.set('strictQuery', true);

const connectDatabase = () => {
    mongoose.connect(process.env.DB_URI, {
        useNewUrlParser: true,
        // useCreateIndex: true,
        useUnifiedTopology: true,
        // useFindAndModify: false
    }).then(() => {
        console.log("Connection is Successful")
    }).catch((err) => console.log(`Somthing wont wrong`))
}

module.exports = connectDatabase