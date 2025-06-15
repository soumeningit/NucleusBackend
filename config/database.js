const mongoose = require("mongoose");

require("dotenv").config();

const dbConnect = () => {
    mongoose.connect(process.env.DATABASE_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
        .then(() => console.log("Database Connected Successfully"))
        .catch((e) => {
            console.log("Database Connection Failed!")
            console.log(e);
            process.exit(1);
        })
}

module.exports = dbConnect;