const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema(
    {
        A: { type: String, required: true },
        B: { type: String, required: true },
        C: { type: String, required: true },
        D: { type: String, required: true },
    },
    { _id: false }
);

const quizQuestionSchema = new mongoose.Schema({
    difficulty: {
        type: String,
        enum: ["Easy", "Medium", "Difficult"],
        required: true
    },
    question: {
        type: String,
        required: true,
        minlength: 5
    },
    options: {
        type: optionSchema,
        required: true
    },
    correctAnswer: {
        type: String,
        enum: ["A", "B", "C", "D"],
        required: true
    },
    quizTopic: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "QuizTopic",
        required: true
    },
    explanation: { type: String },
    tags: [{ type: String, trim: true }],
});

module.exports = mongoose.models.QuizQuestion || mongoose.model("QuizQuestion", quizQuestionSchema);
