const mongoose = require('mongoose');

const enrolledStudentsSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    enrolledOn: {
        type: Date,
        default: Date.now
    },
    amountPaid: {
        type: Number
    }
}, { timestamps: true });

module.exports = mongoose.model('EnrolledStudents', enrolledStudentsSchema);