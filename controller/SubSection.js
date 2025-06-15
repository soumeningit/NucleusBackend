const Section = require("../models/Section")
const SubSection = require("../models/SubSection")
const { uploadFileToCloudinary } = require('../utils/fileUploader')

// create SubSection
exports.createSubSection = async (req, res) => {
    try {
        console.log("Inside createSubSection .....")
        console.log("req.files: ", req.files);
        console.log("req.body: ", req.body);
        // fetch the data
        const { sectionId, title, timeDuration, description } = req.body;
        // fetch the video files
        const video = req.files.video;
        console.log("video in createSubsection : ", video);

        console.log("inside createSubSection : ", sectionId, title, timeDuration, description, video)
        // validate the data
        if (!sectionId || !title || !timeDuration || !description || !video) {
            return res.status(400)
                .json({
                    success: false,
                    message: "Please fill all the fields"
                })
        }
        require("dotenv").config();
        // upload video to cloudinary
        const uploadVideoDetails = await uploadFileToCloudinary(video, process.env.FOLDER_NAME);
        // console.log("uploadVideoDetails : ", uploadVideoDetails)
        // create a SubSection
        const newSubSection = await SubSection.create({
            title: title,
            timeDuration: timeDuration,
            description: description,
            videoUrl: uploadVideoDetails.secure_url,
        });
        // update the Section
        const updateSection = await Section.findByIdAndUpdate(sectionId, { $push: { subSection: newSubSection._id } }, { new: true }).populate("subSection")
        //HW : check once populate
        console.log("updateSection : ", updateSection)

        // return the response
        return res.status(200)
            .json({
                success: true,
                message: "Sub-Section created successfully",
                updateSection
            });

    } catch (error) {
        console.log("Creation of SubSection failed!, please try after some time")
        console.log(error)
        return res.status(400)
            .json({
                success: false,
                message: " Creation of SubSection failed!"
            })
    }
}

// update SubSection
exports.updateSubSection = async (req, res) => {
    try {
        console.log("inside updateSubSection : ", req.body)
        // fetch subsection details
        const { subSectionId, sectionId, title, timeDuration, description } = req.body;

        const video = req.files ? req.files.video : undefined;
        // validate
        if (!subSectionId) {
            return res.status(400)
                .json({
                    success: false,
                    message: "Please fill all the fields"
                })
        }
        const subSection = await SubSection.findById(subSectionId);
        if (!subSection) {
            return res.status(400)
                .json({
                    success: false,
                    message: "SubSection not present"
                })
        }
        if (title !== undefined) {
            subSection.title = title;
        }
        if (description !== undefined) {
            subSection.description = description;
        }
        if (timeDuration !== undefined) {
            subSection.timeDuration = timeDuration;
        }
        if (video !== undefined) {
            const videoDetails = await uploadFileToCloudinary(video, process.env.FOLDER_NAME);
            console.log("videoDetails in subsection update : ", videoDetails)
            subSection.videoUrl = videoDetails.secure_url;
        }

        const updatedSection = await subSection.save();

        // did i need to update section also ?

        return res.json({
            success: true,
            message: "Section updated successfully",
            data: updatedSection,
        })

    } catch (error) {
        console.log("Updation of subsection failed due to some issues.")
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "An error occurred while updating the section",
        })
    }
}

// Delete SubSection
exports.deleteSubSection = async (req, res) => {
    try {
        // fetch section
        const { subSectionId, sectionId } = req.body
        const findData = await Section.findByIdAndUpdate(
            { _id: sectionId },
            {
                $pull: {
                    subSection: subSectionId,
                },
            }
        )
        console.log("findData : ", findData);
        const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })
        console.log("sbsection in delete subsection in server....", subSection)

        if (!subSection) {
            return res
                .status(404)
                .json({ success: false, message: "SubSection not found" })
        }

        // find updated section and return it
        const updatedSection = await Section.findById(sectionId).populate(
            "subSection"
        )

        return res.json({
            success: true,
            message: "SubSection deleted successfully",
            data: updatedSection,
        })

    } catch (error) {
        console.log("Deletion of subsection failed")
        console.error(error)
        return res.status(500).json({
            success: false,
            message: "An error occurred while updating the section",
        })
    }
}