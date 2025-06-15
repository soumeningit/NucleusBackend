const mongoose = require('mongoose')

const adminSchema = new mongoose.Schema({
    courseIds: {
        type: [String],
        default: []
    }
});

module.exports = mongoose.model("Admin", adminSchema);