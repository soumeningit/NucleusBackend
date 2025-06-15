const mongoose = require("mongoose")

const courseSchema = new mongoose.Schema({
    courseName: {
        type: String,
    },
    courseDescription: {
        type: String,
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    whatYouWillLearn: {
        type: [String],
    },
    courseContent: [ //section
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Section"
        }
    ],
    ratingAndReviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RatingAndReview"
        }
    ],
    price: {
        type: Number,
        required: true
    },
    tag: {
        type: [String],
        required: true
    },
    thumbnail: {
        type: String,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },
    // After some operation performed i made change here so in other opeartion here may came ...
    studentsEnrolled: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        // required: true
    }],
    instructions: {
        type: [String],
    },
    status: {
        type: String,
        enum: ["Draft", "Published"],
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    duration: {
        type: String,
        trim: true
    },
    payment: {
        type: String,
    }
});

module.exports = mongoose.model("Course", courseSchema);