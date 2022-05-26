const mongoose = require("mongoose");
require('dotenv').config({path: 'variables.env'});

const connectDb = async () => {
    try{
        await mongoose.connect(process.env.DB_MONGO, {
            user: process.env.DB_USER,
             pass: process.env.DB_PASS,
              dbName: process.env.DB_NAME });
        console.log("Connected to DB");
    }catch(error){
        console.log("Error connecting to DB")
        console.log(error);
        process.exit(1);
    }
}

module.exports = connectDb;