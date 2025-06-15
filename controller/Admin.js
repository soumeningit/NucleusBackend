const Announcements = require('../models/Announcement')
const User = require('../models/User')
const Notification = require('../models/Notification')
const Admin = require("../models/Admin")
const Course = require("../models/Course")

exports.saveMessage = async (req, res) => {
    try {
        console.log("inside findAllUser in Admin server....")
        const { title, message } = req.body;
        if (!title || !message) {
            return res.status(401)
                .json({
                    success: false,
                    message: "title and message both are required"
                })
        }

        const newAnnouncements = new Announcements({ title, message });
        console.log("newAnnouncements : ", newAnnouncements)
        const response = await newAnnouncements.save();
        console.log("response in admin server : ", response)

        if (!response) {
            return res.status(401)
                .json({
                    success: false,
                    message: "saving of title and message in db failed"
                })
        }

        return res.status(200)
            .json({
                success: true,
                message: "data created successfully"
            })

    } catch (error) {
        console.log("admin data save faied : ", error)
        console.log(error)
        return res.status(401)
            .json({
                success: false,
                message: "saving of title and message failed"
            })
    }
}

exports.createNotifications = async (req, res) => {
    try {
        console.log(" inside createNotifications")
        const { title, message } = req.body;
        if (!title || !message) {
            return res.status(401)
                .json({
                    success: false,
                    message: "title and message both are required"
                })
        }

        const users = await User.find({});
        console.log("user in notification : ", users)
        const notification = users.map((user) => ({
            userId: user._id,
            title: `${title}`,
            message: `${message}`
        }))
        console.log("notification : ", notification)
        const saveNotification = await Notification.insertMany(notification);
        console.log("saveNotification : ", saveNotification)
        if (!saveNotification) {
            return res.status(401)
                .json({
                    success: false,
                    message: "saving of title and message in db failed"
                })
        }
        return res.status(200)
            .json({
                success: true,
                message: "data created successfully",
                saveNotification
            })


    } catch (error) {
        console.log("cretae notification faied : ", error)
        console.log(error)
        return res.status(500)
            .json({
                success: false,
                message: "can't create notification right now"
            })
    }
}

exports.sendNotification = async (req, res) => {
    try {

        console.log(" inside sendNotification")
        const userId = req?.user?.id;
        console.log("user id in sendNotification : ", userId)
        console.log("inside sendNotification userId : ", userId)
        const notifications = await Notification.find({ userId: userId }).sort({ createdAt: -1 }).exec();
        console.log("notifications in sendNotification in server side : ", notifications)
        return res.status(200)
            .json({
                success: true,
                notifications
            });

    } catch (error) {
        console.log("send notification faied : ", error)
        console.log("Error : ", error)
        return res.status(500)
            .json({
                success: false,
                message: "can't send notification right now"
            })
    }
}

exports.fetchDraftCourse = async (req, res) => {

    try {
        console.log("INSIDE FETCH DATA COURSE IN SERVER ....")
        const courseId = req.body;
        console.log("courseId in fetchDraftCourse : ", courseId)
    } catch (error) {
        console.log("Fetch draft course faied : ", error)
        console.log("Error : ", error)
        return res.status(500)
            .json({
                success: false,
                message: "Can't fetch courses right now"
            })
    }
}

exports.showDraftCourse = async (req, res) => {
    try {
        console.log("INSIDE SHOW DRAFT COURSE IN SERVER ....")
        const admin = await Admin.findOne({});
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin document not found"
            });
        }
        const courseIds = admin.courseIds;
        console.log("courseIds in showDraftCourse : ", courseIds);

        // Check if courseIds array is empty
        if (courseIds?.length === 0) {
            return res.status(200).json({
                success: true,
                data: [], // No courses found
            });
        }

        const allCourses = await Course.find(
            { _id: { $in: courseIds } },
            {
                courseName: true,
                price: true,
                thumbnail: true,
                instructor: true,
                ratingAndReviews: true,
                studentsEnrolled: true,
                status: true
            }
        )
            .populate("instructor")
            .exec()

        console.log("All courses in show draft course : ", allCourses, " ", allCourses.length);

        return res.status(200).json({
            success: true,
            data: allCourses,
        })

    } catch (error) {
        console.log("Show draft course faied : ", error)
        console.log("Error : ", error)
        return res.status(500)
            .json({
                success: false,
                message: "Can't show courses right now"
            })

    }

}

exports.approveCourse = async (req, res) => {
    try {
        console.log("inside approveCourseAPI in server");
        console.log("req.body : ", req.body);
        const { courseId } = req.body;
        console.log("courseId : ", courseId);
        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: "Course id is required"
            })
        }

        const updatedCourse = await Course.findByIdAndUpdate({ _id: courseId }, { status: "Published" }, { new: true })
        console.log("updatedCourse : ", updatedCourse);

        // const courseIds = Admin.courseIds || [];
        const admin = await Admin.findOne({});
        console.log("courseIds : ", admin);


        const filteredCourse = admin.courseIds.filter(id => id !== courseId);
        console.log("filteredCourse : ", filteredCourse);

        admin.courseIds = filteredCourse;
        // await Admin.save();

        await admin.save()

        return res.status(200)
            .json({
                success: true,
                message: "Course approved successfully",
                data: updatedCourse
            })

    } catch (e) {
        console.log("Error in approve course api : ", e)
        console.log("Error : ", e)
        return res.status(500)
            .json({
                success: false,
                message: "Can't approve courses right now"
            })
    }
}

exports.getAllUser = async (req, res) => {
    try {
        const users = await User.find()
        return res.status(200).json({
            success: true,
            users
        })
    }
    catch (e) {
        console.log("Error in getAllUser api : ", e)
        return res.status(500).json({
            success: false,
            message: "Can't get users right now"
        })
    }
}