const { Question, Reply } = require("../models/Message");
const SubSection = require("../models/SubSection");
const User = require("../models/User");
const Course = require("../models/Course");
const Section = require("../models/Section");

exports.createMessage = async (req, res) => {

    try {
        console.log("inside createMessage inside server....")
        const userId = req.user.id;
        const { message } = req.body;
        const { courseId, sectionId, subSectionId } = req.body;

        if (!userId || !message || !courseId || !sectionId || !subSectionId) {
            return res.status(400)
                .json({
                    success: false,
                    message: "Please fill all the fields"
                });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(400)
                .json({
                    success: false,
                    message: "User not found"
                });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(400)
                .json({
                    success: false,
                    message: "Course not found"
                });
        }
        const section = await Section.findById(sectionId);
        if (!section) {
            return res.status(400)
                .json({
                    success: false,
                    message: "Section not found"
                });
        }
        const video = await SubSection.findById(subSectionId);
        if (!video) {
            return res.status(400)
                .json({
                    success: false,
                    message: "Video not found"
                });
        }
        const newMessage = new Question({
            courseId,
            sectionId,
            videoId: subSectionId,
            userId,
            content: message
        })

        const createMessage = await newMessage.save();
        console.log("createMessage : ", createMessage);

        return res.status(200)
            .json({
                success: true,
                message: "Question created successfully",
                data: createMessage
            });

    } catch (error) {
        console.log("message creation failed " + error)
        console.log(error);
        res.status(500)
            .json({
                success: false,
                message: 'Server error'
            });
    }
}

exports.createReply = async (req, res) => {
    try {
        console.log("INSIDE CREATE REPLY CONTROLLER....")
        // console.log("request : ", req);
        const { message, questionId } = req?.body;
        const userId = req?.user?.id;

        console.log("message, questionId, userId : ", message, questionId, userId)

        if (!message, !questionId || !userId) {
            return res.status(400)
                .json({
                    success: false,
                    message: "Invalid request"
                });
        }
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(400)
                .json({
                    success: false,
                    message: "Question not found"
                });
        }
        const reply = new Reply({
            questionId,
            userId,
            reply: message
        })

        const createReply = await reply.save();
        console.log("createReply : ", createReply);
        return res.status(200)
            .json({
                success: true,
                message: "Reply created successfully",
                data: createReply
            })

    }
    catch (error) {
        console.log("reply failed in server" + error)
        console.log(error);
        res.status(500)
            .json({
                success: false,
                message: 'Server error'
            });
    }
}

exports.showAllQuestion = async (req, res) => {
    try {
        const questions = await Question.find()
            .populate('courseId', 'name') // Optionally populate related fields
            .populate('sectionId', 'SectionName') // Optionally populate related fields
            .populate('videoId', 'title') // Optionally populate related fields
            .populate('userId', 'firstName lastName image') // Optionally populate related fields
            .populate('replies'); // Optionally populate related fields

        console.log("questions : ", questions);

        res.status(200)
            .json({
                success: true,
                data: questions
            });

    } catch (e) {
        console.log("Failed to feth questions : ", e);
        console.log(e);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

exports.showAllReply = async (req, res) => {
    try {
        console.log("INSIDE SHOW ALL REPLY INSIDE SERVER....");
        console.log("request : ", req);
        console.log("req ki body : ", req.body);
        const { sectionId } = req.body;
        const { subSectionId } = req.body;
        const { questionId } = req.body;
        console.log("sectionId : ", sectionId);
        console.log("subSectionId : ", subSectionId);
        console.log("questionId : ", questionId);
        if (!sectionId || !subSectionId || !questionId) {
            return res.status(404)
                .json({
                    success: false,
                    message: "Please provide all the required fields"
                })
        }

        const section = await Section.findById(sectionId);
        console.log("section : ", section);

        if (!section) {
            return res.status(404)
                .json({
                    success: false,
                    message: "Section not found"
                })
        }
        const subSection = await SubSection.findById(subSectionId);
        console.log("subSection : ", subSection);
        if (!subSection) {
            return res.status(404)
                .json({
                    success: false,
                    message: "SubSection not found"
                })
        }
        const question = await Question.findById(questionId).populate({
            path: 'replies',
            populate: {
                path: 'userId',
                select: 'firstName lastName image'
            }
        })
        console.log("question : ", question);
        if (!question) {
            return res.status(404)
                .json({
                    success: false,
                    message: "Question not found"
                })
        }

        const replies = await Reply.find({
            questionId: questionId
        }).populate('userId', 'firstName lastName image');

        console.log("replies : ", replies);

        res.status(200)
            .json({
                success: true,
                data: replies
            })

    } catch (error) {
        console.log("Failed to feth replys : ", e);
        console.log(e);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}