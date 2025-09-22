const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    dateOfIssue: {
        type: Date,
        default: Date.now
    },
    certificateId: {
        type: String,
        unique: true
    },
    file: {
        type: String,
    }
}, { timestamps: true });

module.exports = mongoose.model("Certificate", certificateSchema);