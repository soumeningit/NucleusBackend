const mongoose = require("mongoose");

const quizAttemptSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Quiz"
    },
    score: {
        type: Number,
    },
    responses: [
        {
            questionId: mongoose.Schema.Types.ObjectId,
            selectedAnswer: {
                type: String,
            },
            isCorrect: Boolean,
        },
    ],
    startedAt: {
        type: Date,
        default: Date.now,
    },
    completedAt: Date,
}, { timestamps: true }
);

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);