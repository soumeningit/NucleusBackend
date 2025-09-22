const Course = require("../models/Course")
const Profile = require("../models/Profile")
const RatingAndReview = require("../models/RatingAndReview");
const EnrolledStudents = require("../models/EnrolledStudents");
const User = require("../models/User")
const CourseProgress = require("../models/CourseProgress");
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

        const enrolledCoursesResp = await User.findOne({ _id: userId })
            .select("courses courseProgress")
            .populate({
                path: "courses",
                select: "courseName courseDescription price thumbnail courseContent",
                populate: {
                    path: "courseContent",
                    select: "subSection",
                }
            });

        // console.log("enrolledCourses : ", enrolledCoursesResp);

        if (!enrolledCoursesResp) {
            return res.status(400).json({
                success: false,
                message: "No courses enrolled yet"
            })
        }

        const courseProgressDetails = await CourseProgress.find({
            userId: userId,
            courseId: { $in: enrolledCoursesResp.courses.map(course => course._id) }
        });

        // console.log("courseProgressDetails : ", courseProgressDetails);

        const enrolledCourses = enrolledCoursesResp.courses;

        let response = [];
        let totalVideos = 0;
        let video = {};
        let completedVideos = {};

        enrolledCourses.forEach((course) => {
            console.log("course Id : ", course._id);
            console.log("section : ", course.courseContent);
            const courseProgress = courseProgressDetails.find(progress => progress.courseId.toString() === course._id.toString());
            completedVideos[course._id] = courseProgress ? courseProgress.completedVideos.length : 0;
            for (let section of course.courseContent) {
                totalVideos += section.subSection.length;
            }
            video[course._id] = { totalVideos };
            response.push({
                totalVideos,
                completedVideos: completedVideos[course._id],
                courseId: course._id,
                courseName: course.courseName,
                courseDescription: course.courseDescription,
                thumbnail: course.thumbnail,
                price: course.price
            });
        });

        console.log("totalVideos : ", totalVideos);
        console.log("courseProgressDetails : ", courseProgressDetails);

        console.log("response : ", response);

        // Combine both into a single object for easier frontend use
        return res.status(200).json({
            success: true,
            message: "Courses fetched successfully",
            data: response
        });


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

        const userId = req.query.userId || req.user.id;

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

exports.analytics = async (req, res) => {
    try {
        console.log("inside analytics inside server.");
        const userId = req.user.id;
        console.log("userId inside analytics in backend : ", userId);

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "Need to login first",
            });
        }

        console.log("req.query : ", req.query);

        let requiredTime = parseInt(req.query.days) || 7; // default 7
        console.log("requiredTime : ", requiredTime);

        let startDate = null;
        let isAllTime = false;

        if (requiredTime > 30) {
            isAllTime = true;
        } else {
            startDate = new Date();
            startDate.setDate(startDate.getDate() - requiredTime);
        }

        // Get all courses by this instructor
        const courses = await Course.find({ instructor: userId })
            .select("courseName price enrolledData ratingAndReviews studentsEnrolled")
            .populate({
                path: "enrolledData",
            })
            .populate("ratingAndReviews");

        // console.log("courses : ", courses);

        if (!courses || courses.length === 0) {
            console.log("No courses found for this instructor");
            return res.status(200).json({
                totalRevenue: 0,
                totalEnrollments: 0,
                averageRating: 0,
                revenueTrend: [],
                message: "No courses found for this instructor",
            });
        }

        let totalRevenue = 0;
        let totalEnrollments = 0;
        let allRatings = [];

        // Initialize daily trend map only if not all-time
        const trendMap = {};
        if (!isAllTime) {
            for (let i = 0; i < requiredTime; i++) {
                const date = new Date();
                date.setDate(date.getDate() - (requiredTime - 1 - i));
                const key =
                    i === requiredTime - 1
                        ? "Today"
                        : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                trendMap[key] = { revenue: 0, enrollments: 0 };
            }
        }

        // console.log("trendMap initialized: ", trendMap);

        // Process each course
        for (const course of courses) {
            console.log("Processing course: ", course);
            const price = course.price || 0;

            // Process each enrollment with real enrolledOn date
            for (const enrollment of course.enrolledData) {
                const enrollDate = new Date(enrollment.enrolledOn);

                if (isAllTime || enrollDate >= startDate) {
                    totalEnrollments += 1;
                    totalRevenue += price;

                    if (!isAllTime) {
                        const key =
                            enrollDate.toDateString() === new Date().toDateString()
                                ? "Today"
                                : enrollDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

                        if (trendMap[key]) {
                            trendMap[key].enrollments += 1;
                            trendMap[key].revenue += price;
                        }
                    }
                }
            }

            // Collect ratings
            for (const ratingObj of course.ratingAndReviews) {
                allRatings.push(ratingObj.rating);
            }
        }

        const averageRating =
            allRatings.length > 0
                ? allRatings.reduce((acc, val) => acc + val, 0) / allRatings.length
                : 0;

        let revenueTrend = [];
        if (!isAllTime) {
            revenueTrend = Object.keys(trendMap).map((key) => ({
                name: key,
                revenue: trendMap[key].revenue,
                enrollments: trendMap[key].enrollments,
            }));
        }

        console.log("totalRevenue: ", totalRevenue, " totalEnrollments: ", totalEnrollments, " averageRating: ", averageRating);
        console.log("revenueTrend: ", revenueTrend);

        return res.json({
            totalRevenue: parseFloat(totalRevenue.toFixed(2)),
            totalEnrollments,
            averageRating: parseFloat(averageRating.toFixed(1)),
            revenueTrend: isAllTime ? [] : revenueTrend, // all-time → no daily breakdown
            courses: courses
        });

    } catch (error) {
        console.log("error in analytics: " + error);
        return res.status(500).json({
            success: false,
            message: "Can't get analytics right now, please try after some time",
        });
    }
};

