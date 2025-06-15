const CourseProgress = require("../models/CourseProgress");
const SubSection = require("../models/SubSection");

exports.courseProgress = async (req, res) => {
    try {
        console.log("INSIDE COURSE PROGRESS INSIDE SERVER ....")
        console.log("BODY : ", req.body);
        const { courseId } = req.body;
        const { subSectionId } = req.body;
        const userId = req.user.id;

        console.log("courseId in server inside courseProgress : ", courseId)
        console.log("subSectionId in server inside courseProgress : ", subSectionId)
        console.log("userId in server inside courseProgress : ", userId)

        if (!courseId || !subSectionId) {
            return res.status(400).json({ success: false, message: "Please provide sectionId and subSectionId" })
        }
        const subSection = await SubSection.findById(subSectionId);
        if (!subSection) {
            return res.status(400).json({ success: false, message: "subSection is not present" })
        }
        console.log("subSection : ", subSection)
        let courseProgress = await CourseProgress.findOne({
            courseId: courseId,
            userId: userId
        });
        console.log("courseProgress : ", courseProgress)
        if (!courseProgress) {
            return res.status(400).json({ success: false, message: "courseProgress is not present" })
        }

        else {

            if (courseProgress.completedVideos.includes(subSectionId)) {
                return res.json({ success: false, message: "course is already marked as completed" })
            }
            courseProgress.completedVideos.push(subSectionId)
        }

        const updateCourseProgress = await courseProgress.save();
        return res.status(200).json({ success: true, message: "courseProgress updated successfully", data: updateCourseProgress })
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong to complete course progress",
        });
    }
}