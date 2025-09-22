const mongoose = require("mongoose");

const quizSchema = new mongoose.Schema({
    topic: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "QuizTopic"
    },
    attemptBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "QuizQuestion"
    }],
    attempts: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "QuizAttempt"
    },
}, { timestamps: true });

module.exports = mongoose.model("Quiz", quizSchema);