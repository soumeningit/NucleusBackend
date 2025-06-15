const Course = require("../models/Course")
const Profile = require("../models/Profile")
const User = require("../models/User")
const { uploadFileToCloudinary } = require("../utils/fileUploader")

// update profile : because alredy i made object of Profile and 
// put the value of null of all the values in Auth.js
// So now I need to update this.

exports.updateProfile = async (req, res) => {
    try {
        console.log("inside update profile ..")
        // fetch the data
        const { gender = "", contactNumber, dateOfBirth = "", about = "" } = req.body;
        // validate the data
        console.log("inside update profile server : ", " gender : ", gender, " contactNumber : ", contactNumber, " dateOfBirth : ", dateOfBirth, " about : ", about)
        if (!contactNumber) {
            return res.status(400).json({
                Success: false,
                message: "Please fill all the fields."
            })
        }
        // find profile to update the data
        // but we don't have profile id
        // so we will use the user id to find the profile
        const userId = req.user.id;
        console.log("userId ", userId);
        // validate user id
        if (!userId) {
            return res.status(400).json({
                Success: false,
                message: "Please fill all the fields."
            })
        }
        // fetch the user details, inside user details profile id must be present
        const userDetails = await User.findById({ _id: userId })
        console.log("userDetails ", userDetails)
        const profileId = userDetails.additionalDetails;
        // find the profile to update the data
        const profileDetails = await Profile.findById(profileId)


        console.log("profileDetails ", profileDetails)

        // update the profile details 
        profileDetails.gender = gender;
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;

        // save the profile details
        await profileDetails.save();

        const updatedUserDetails = await User.findById({ _id: userId })
            .populate("additionalDetails")
            .exec()

        console.log("updatedUserDetails ", updatedUserDetails)

        // await profileDetails.save();

        // send response
        return res.status(200)
            .json({
                success: true,
                message: " Profile updated successfully",
                data: updatedUserDetails
            });

    } catch (error) {
        console.log("Updation of Profile failed!, please try after some time")
        console.log(error)
        return res.status(400)
            .json({
                success: false,
                message: "Updation of Profile failed!"
            });
    }
}

// delete account
exports.deleteAccount = async (req, res) => {
    try {
        // find the user details
        const userId = req.user.id;
        // validate
        if (!userId) {
            return res.status(400).json({
                Success: false,
                message: "Please fill all the fields."
            })
        }
        // check in db if that user present or not
        const userDetails = await User.findById(userId);
        if (!userDetails) {
            return res.status(400).json({
                Success: false,
                message: "User not exsist"
            })
        }
        // delete the profile
        // delete from profile
        await Profile.findByIdAndDelete({ _id: userDetails.additionalDetails });
        // delete from User
        await User.findByIdAndDelete({ _id: userId });
        // send the response
        return res.status(200)
            .json({
                success: true,
                message: " Profile deleted successfully",
            });

    } catch (error) {
        console.log("Deletion of Profile failed!, please try after some time")
        console.log(error)
        return res.status(400)
            .json({
                success: false,
                message: "Deletion of Profile failed!"
            });
    }
}

// HW : what is cron job
// HW : Explore how can I schedule this delete for some days


// get all user details
exports.getAllUserDetails = async (req, res) => {
    try {
        // find the user details
        const userId = req.user.id;
        console.log("user id ", userId);
        // validate
        if (!userId) {
            return res.status(400).json({
                Success: false,
                message: "Please fill all the fields."
            })
        }
        // check in db if that user present or not
        const userDetails = await User.findById({ _id: userId }).populate("additionalDetails").exec();
        userDetails.password = null;
        console.log("userDetails in profile in server : ", userDetails)

        return res.status(200)
            .json({
                success: true,
                message: " User all detailed fetched successfully",
                data: userDetails
            });

    } catch (error) {
        console.log("Can't get all user details right now, please try after some time")
        console.log(error)
        return res.status(400)
            .json({
                success: false,
                message: "User not found"
            });
    }
}

// update picture
exports.updatePicture = async (req, res) => {
    try {
        console.log("Inside update picture function..")
        // find the user details
        const userId = req.user.id;
        console.log("user id inside updatePicture in server: ", userId);
        // image fetch
        const img = req.files.displayimage;
        // const img = req.image;
        console.log("image inside server ", img);
        // validate
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User don't exsist."
            })
        }
        if (!img) {
            return res.status(400).json({
                success: false,
                message: "please provide photo"
            })
        }
        // upload to cloud
        const uploadResponse = await uploadFileToCloudinary(img, process.env.FOLDER_NAME);
        console.log("uploadResponse : ", uploadResponse)
        // update the user details,save in db

        const updateUserDetails = await User.findByIdAndUpdate(
            { _id: userId },
            { image: uploadResponse.secure_url },
            { new: true }
        );

        console.log("UpdateUserDetails : ", updateUserDetails)
        // return success message with response
        return res.status(200)
            .json({
                success: true,
                messsage: "Profile Photo Updated Successfully",
                data: updateUserDetails
            })
    } catch (error) {
        console.log("Can't update picture right now, please try after some time")
        console.log(error)
        return res.status(400)
            .json({
                success: false,
                message: "Can't update picture right now, please try after some time"
            })
    }
}

// get enrolled courses of a user
exports.getEnrolledCourse = async (req, res) => {
    try {

        console.log("inside getEnrolledCourse inside server.")
        const userId = req.user.id;
        console.log("userId inside inside getEnrolledCourse in backend : ", userId)
        const enrolledCourses = await User.findOne({ _id: userId }).populate({
            path: "courses",
            populate: {
                path: "courseContent",
                populate: {
                    path: "subSection"
                }
            }
        });
        console.log("enrolledCourses : ", enrolledCourses)

        if (!enrolledCourses) {
            return res.status(400).json({
                success: false,
                message: "No courses enrolled yet"
            })
        }

        return res.status(200)
            .json({
                success: true,
                message: "Courses fetched successfully",
                enrolledCourses
            })


    } catch (error) {
        console.log(error)
        return res.status(500)
            .json({
                success: false,
                message: "Can't get enrolled courses right now, please try after some time"
            })
    }
}

// Instructor Dashboard
exports.instructorDashboard = async (req, res) => {
    try {
        console.log("inside getEnrolledCourseForInstructor inside server.")
        const instructorId = req.user.id;
        if (!instructorId) {
            return res.status(400).json({
                success: false,
                message: "Instructor not found"
            })
        }
        console.log("instructorId inside getEnrolledCourseForInstructor in backend : ", instructorId);
        const courseDetails = await Course.find({ instructor: instructorId });
        if (!courseDetails) {
            return res.status(400).json({
                success: false,
                message: "No courses found for this instructor"
            })
        }
        // console.log("courseDetails inside getEnrolledCourseForInstructor in backend : ", courseDetails);

        let noOfStudentsEnrolled = 0;
        let totalAmount = 0;
        const courseData = courseDetails.map((course) => {
            noOfStudentsEnrolled = course.studentsEnrolled.length;
            totalAmount = course.price * noOfStudentsEnrolled;
            let enrolledCourseData = {
                noOfStudentsEnrolled,
                totalAmount,
                _id: course._id,
                courseName: course.courseName,
                courseDescription: course.courseDescription,
            }
            return enrolledCourseData;
        });

        console.log("noOfStudentsEnrolled : ", noOfStudentsEnrolled, " totalAmount : ", totalAmount);

        return res.status(200)
            .json({
                success: true,
                message: "Courses fetched successfully",
                enrolledCourseData: courseData
            })
    }
    catch (error) {
        console.log("Instructor details fetch failed")
        return res.status(500)
            .json({
                success: false,
                message: "Can't get enrolled courses right now, please try after some time"
            })
    }
}

exports.getUserDetails = async (req, res) => {
    try {
        console.log("inside getUserDetails inside server.");

        console.log("req " + req);
        console.log("req.query : ", req.query);

        const userId = req.query.userId;

        console.log("userId inside getUserDetails in backend : ", userId);

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "User ID is required"
            });
        }

        const isUserExists = await User.findById({ _id: userId }).populate("additionalDetails").exec();
        if (!isUserExists) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        console.log("isUserExists : ", isUserExists);
        isUserExists.password = null; // Remove password from response

        return res.status(200)
            .json({
                success: true,
                message: "User details fetched successfully",
                data: isUserExists
            });

    } catch (error) {
        console.log("Can't get user details right now, please try after some time")
        console.log(error)
        return res.status(500)
            .json({
                success: false,
                message: "Can't get user details right now, please try after some time"
            })

    }
}
