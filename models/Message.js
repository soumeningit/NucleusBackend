const mongoose = require("mongoose")

const questionSchema = new mongoose.Schema({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course"
    },
    sectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section"
    },
    videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SubSection"
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    content: {
        type: String,
        required: true
    },
    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reply'
    }]

}, { timestamps: true });


const replySchema = new mongoose.Schema({
    questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question"
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    reply: {
        type: String,
        required: true
    }
}, { timestamps: true });


// module.exports = mongoose.model("Question", questionSchema);
// module.exports = mongoose.model("Reply", replySchema);

const Question = mongoose.model("Question", questionSchema);
const Reply = mongoose.model("Reply", replySchema);

module.exports = { Question, Reply };