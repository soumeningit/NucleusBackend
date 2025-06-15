const Section = require("../models/Section");
const Course = require("../models/Course")

// Create Section
exports.createSection = async (req, res) => {
    try {
        console.log("Inside create section in server....")
        // fetch section name, course id(konsa course ka section ha)
        const { sectionName, courseId } = req.body;
        // validate
        if (!sectionName || !courseId) {
            return res.status(400)
                .json({
                    success: false,
                    message: "Please fill all the fields"
                })
        }
        // craete section
        const section = await Section.create({ sectionName: sectionName });
        // update into course model
        const updateCourseDetails = await Course.findByIdAndUpdate(
            courseId, { $push: { courseContent: section._id } },
            { new: true }
        )
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec();

        // return response
        return res.status(200)
            .json({
                success: true,
                message: "Section created successfully",
                updateCourseDetails
            });

    } catch (e) {
        console.log("Creation of section failed!, please try after some time")
        console.log(e)
        return res.status(400)
            .json({
                success: false,
                message: " Creation of section failed!"
            })
    }
}

// update section
exports.updateSection = async (req, res) => {
    try {
        // fetch data
        const { sectionName, sectionId } = req.body;
        // validate data
        if (!sectionName || !sectionId) {
            return res.status(400)
                .json({
                    success: false,
                    message: "Please fill all the fields"
                })
        }
        // update the dta
        const updateSection = await Section.findByIdAndUpdate(sectionId, { sectionName: sectionName }, { new: true });
        // return response
        return res.status(200)
            .json({
                success: true,
                message: "Section updated successfully",
                updateSection
            });

    } catch (error) {
        console.log("Updation of section failed!, please try after some time")
        console.log(error)
        return res.status(400)
            .json({
                success: false,
                message: " Updation of section failed!"
            })
    }
}

// delete any section
exports.deleteSection = async (req, res) => {
    try {
        console.log("INSIDE DELETESECTION SERVER....")
        // fetch data
        const { sectionId } = req.body;
        console.log("sectionId : ", sectionId)
        // validate data
        if (!sectionId) {
            return res.status(400)
                .json({
                    success: false,
                    message: "Please fill all the fields"
                })
        }
        // check the secton is present or not
        const verifiedSection = await Section.findOne({ _id: sectionId });
        console.log("verifiedSection : ", verifiedSection)
        if (!verifiedSection) {
            return res.status(400)
                .json({
                    success: false,
                    message: "Section not found"
                })
        }
        // if present then delete it
        await Section.findByIdAndDelete({ _id: sectionId });
        // TODO : do we need to delete the section id from the course also

        // return response
        return res.status(200)
            .json({
                success: true,
                message: "Section deleted successfully",
            });

    } catch (error) {
        console.log("Deletion of section failed!, please try after some time")
        console.log(error)
        return res.status(400)
            .json({
                success: false,
                message: " deletion of section failed!"
            })
    }
}