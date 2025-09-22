const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
    },
    accountType: {
        type: String,
        required: true,
        enum: ["Student", "Instructor", "Admin"],
        default: "Student"
    },
    additionalDetails: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Profile",
    },
    courses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course"
        }
    ],
    image: {
        type: String,
    },
    token: {
        type: String,
    },
    resetTokenTime: {
        type: Date,
    },
    courseProgress: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CourseProgress",
        }
    ],
    accountStatus: {
        type: String,
        enum: ["pending", "active", "suspended", "deactivated"],
        default: "active"
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    isOAuthUser: {
        type: Boolean,
        default: false
    },
    oAuthData: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OAuthUser"
    }

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);