const Course = require("../models/Course")
const Category = require("../models/Category")
const Section = require("../models/Section")
const SubSection = require("../models/SubSection")
const User = require("../models/User")
const { uploadFileToCloudinary } = require("../utils/fileUploader")
// const CourseProgress = require("../models/CourseProgress")
const Announcements = require("../models/Announcement")
const Admin = require("../models/Admin")

// create course
exports.createCourse = async (req, res) => {
    console.log("Inside create course..")
    try {

        console.log("req.user ", req.user)
        // Get user ID from request object
        const userId = req.user.id
        console.log("user id ", userId);


        // Get all required fields from request body
        let {
            courseName,
            courseDescription,
            whatYouWillLearn: _whatYouWillLearn,
            price,
            tag: Tag,
            category,
            instructions: _instructions,
            status
        } = req.body

        console.log("Tag ", Tag)
        console.log(" category in create course in server : ", category);
        // Get thumbnail image from request files
        const thumbnail = req.files.thumbnailImage
        console.log("thumbnail ", thumbnail)

        // let tag, instructions;
        // Convert the tag and instructions from stringified Array to Array
        // try {
        //     const tag = JSON.parse(Tag)
        //     const instructions = JSON.parse(_instructions)
        // } catch (error) {
        //     console.log("Parsing Failed!")
        //     console.log(error)
        // }
        const tag = JSON.parse(Tag)
        const instructions = JSON.parse(_instructions)
        const whatYouWillLearn = JSON.parse(_whatYouWillLearn)

        console.log("tag", tag)
        console.log("instructions", instructions)
        console.log("whatYouWillLearn ", whatYouWillLearn)

        // Check if any of the required fields are missing
        if (
            !courseName ||
            !courseDescription ||
            !whatYouWillLearn.length ||
            !price ||
            !tag.length ||
            !thumbnail ||
            !category ||
            !instructions.length
        ) {
            return res.status(400).json({
                success: false,
                message: "All Fields are Mandatory",
            })
        }
        if (!status || status === undefined) {
            status = "Draft"
        }
        // Check if the user is an instructor
        const instructorDetails = await User.findById(userId, {
            accountType: "Instructor",
        })

        if (!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: "Instructor Details Not Found",
            })
        }

        // Check if the tag given is valid
        const categoryDetails = await Category.findById(category)
        if (!categoryDetails) {
            return res.status(404).json({
                success: false,
                message: "Category Details Not Found",
            })
        }
        console.log("categoryDetails : ", categoryDetails)
        // Upload the Thumbnail to Cloudinary
        const thumbnailImage = await uploadFileToCloudinary(
            thumbnail,
            process.env.FOLDER_NAME
        )
        console.log(thumbnailImage)
        // Create a new course with the given details
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn,
            price,
            tag,
            category: categoryDetails._id,
            thumbnail: thumbnailImage.secure_url,
            status: status,
            instructions,
        })

        console.log("newCourse : ", newCourse)

        // Add the new course to the User Schema of the Instructor
        await User.findByIdAndUpdate(
            {
                _id: instructorDetails._id,
            },
            {
                $push: {
                    courses: newCourse._id,
                },
            },
            { new: true }
        )
        // Add the new course to the Categories
        const categoryDetails2 = await Category.findByIdAndUpdate(
            { _id: category },
            {
                $push: {
                    course: newCourse._id,
                },
            },
            { new: true }
        )
        console.log("categoryDetails2 ", categoryDetails2)
        // Return the new course and a success message
        res.status(200).json({
            success: true,
            data: newCourse,
            message: "Course Created Successfully",
        })
    } catch (error) {
        // Handle any errors that occur during the creation of the course
        console.error(error)
        res.status(500).json({
            success: false,
            message: "Failed to create course",
            error: error.message,
        })
    }
}

// get all course
exports.getAllCourses = async (req, res) => {
    try {
        const allCourses = await Course.find(
            { status: "Published" },
            {
                courseName: true,
                price: true,
                thumbnail: true,
                instructor: true,
                ratingAndReviews: true,
                studentsEnrolled: true,
                category: true
            }
        )
            .populate("instructor")
            .exec()

        return res.status(200).json({
            success: true,
            data: allCourses,
        })
    } catch (error) {
        console.log(error)
        return res.status(404).json({
            success: false,
            message: `Can't Fetch Course Data`,
            error: error.message,
        })
    }
}

// get AllCourseDetails
exports.getCoursedetails = async (req, res) => {
    try {
        console.log("Inside getCoursedetails....")
        const { courseId } = req.body
        console.log("Insiside server getCoursedetails courseId : ", courseId)
        // const userId = req.user.id
        const courseDetails = await Course.findOne({
            _id: courseId,
        })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")
            // .populate("ratingAndReviews")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                },
            })
            .exec();
        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: `Could not find the course with course id ${courseId}`
            })
        }
        return res.status(200)
            .json({
                success: true,
                message: "Course Details Fetched Successfully",
                data: courseDetails
            })
    }
    catch (error) {
        console.log("Could not find the course details")
        console.log(error)
        return res.status(401)
            .json({
                success: false,
                message: `Could not find the course details`,
            })
    }
}


exports.getInstructorCourses = async (req, res) => {
    try {
        console.log("INSIDE INSTRUCTOR COURSE DETAILS IN SERVER....")
        const userId = req.user.id;
        console.log("userId in instructor course : ", userId)
        // Find all courses belonging to the instructor
        const instructorCourses = await Course.find({
            instructor: userId,
            status: "Published",
        }).sort({ createdAt: -1 })

        // Return the instructor's courses
        res.status(200).json({
            success: true,
            data: instructorCourses,
        })
    } catch (error) {
        console.log("Instructor course not found")
        console.log(error)
        return res.status(500)
            .json({
                success: false,
                message: `Could not find the course details`,
            })
    }
}

// send to admin for publish the course
// exports.publishCourse = async (req, res) => {
//     try {

//         console.log("INSIDE PUBLISH COURSE IN SERVER....")
//         const courseId = req.body.courseId;
//         console.log("courseId in publish course : ", courseId)
//         if (!courseId) {
//             return res.status(401)
//                 .json({
//                     success: false,
//                     message: `Could not find the courseId`
//                 })
//         }

//         // const response = await Announcements.findById({ courseId });
//         // console.log("response in publish course : ", response)
//         // if (!response) {
//         if (!Announcements.courseIds.includes(courseId)) {
//             const result = await Announcements.courseIds.push(courseId)
//             // }
//             return res.status(200).
//                 json({
//                     success: true,
//                     message: `Course addded successfully`
//                 })
//         }
//         // }
//         else {
//             return res.status(400).json({
//                 success: false,
//                 message: `Course already exists`
//             });
//         }

//     } catch (error) {
//         console.log("Course send to admin failed....")
//         console.log(error)
//         return res.status(500)
//             .json({
//                 success: false,
//                 message: `Sending course to the admin failed`,
//             })
//     }
// }
exports.publishCourse = async (req, res) => {
    try {
        console.log("INSIDE PUBLISH COURSE IN SERVER....");
        const courseId = req.body.courseId;
        console.log("courseId in publish course : ", courseId);

        if (!courseId) {
            return res.status(401).json({
                success: false,
                message: `Could not find the courseId`
            });
        }

        // Find the announcement document (assuming there's only one for simplicity)
        // const admin = await Admin.findOne({});

        // Find the admin document
        let admin = await Admin.findOne({});

        if (!admin) {
            // Optionally create a new admin document if none exists
            admin = new Admin({ courseIds: [] });
            await admin.save();
            return res.status(201).json({
                success: true,
                message: `Created new admin document`,
                admin
            });
        }

        console.log("admin in publish course : ", admin);

        // Check if courseId already exists in the courseIds array
        if (!admin.courseIds.includes(courseId)) {
            admin.courseIds.push(courseId);
            await admin.save(); // Save the updated document
            return res.status(200).json({
                success: true,
                message: `Course added successfully`
            });
        } else {
            return res.status(400).json({
                success: false,
                message: `Course already exists`
            });
        }

    } catch (error) {
        console.log("Course send to admin failed....");
        console.log(error);
        return res.status(500).json({
            success: false,
            message: `Sending course to the admin failed`,
        });
    }
};

exports.getCourseById = async (req, res) => {
    try {
        console.log("Inside get course by Id....");
        console.log("req.query.courseId : " + req.query.courseId)
        const courseId = req.query.courseId;

        if (!courseId) {
            return res.status(404).json({
                success: false,
                message: "CourseId is Required"
            })
        }

        const course = await Course.findById({ _id: courseId })
            .populate("instructor", "firstName, lastName, email")
            .populate("category")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                    model: "SubSection"
                }
            });

        console.log("course : " + course);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Course fetched successfully",
            data: course,
        });

    } catch (error) {
        console.log("Error in get course by Id : " + error);
        return res.status(501).json({
            success: false,
            message: "Error in get this course"
        })
    }
}

exports.editCourse = async (req, res) => {
    try {
        console.log("Inside edit course....");
        console.log("req.body : ", req.body);

        const courseData = req.body;
        console.log("courseData : ", courseData);
        console.log("courseData : ", JSON.stringify(courseData));

        for (const key in courseData) {
            console.log(`${key}: ${courseData[key]}`);
        }

        const courseId = courseData.courseId || req.query.courseId;
        if (!courseId) {
            return res.status(404).json({
                success: false,
                message: "CourseId is Required"
            })
        }

        const course = await Course.findById({ _id: courseId });
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }
        console.log("courseData.isImageChange : " + courseData.isImageChange);
        console.log("typeof courseData.isImageChange:", typeof courseData.isImageChange);
        const isImageChange = String(courseData.isImageChange).toLowerCase() === "true";

        if (isImageChange) {
            const thumbnail = req.files.thumbnail;
            console.log("thumbnail : ", thumbnail);
            if (!thumbnail) {
                return res.status(400).json({
                    success: false,
                    message: "Thumbnail image is required"
                });
            }
            // Upload the new thumbnail image to Cloudinary
            const thumbnailImage = await uploadFileToCloudinary(
                thumbnail,
                process.env.FOLDER_NAME
            )
            console.log("thumbnailImage : ", thumbnailImage);
            course.thumbnail = thumbnailImage.secure_url;

            const updateimageData = await course.save();
            console.log("updateimageData : ", updateimageData);
            if (!updateimageData) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to update thumbnail image"
                });
            }
        }

        // Update the course details
        course.courseName = courseData.courseName || course.courseName;
        course.courseDescription = courseData.courseDescription || course.courseDescription;
        course.whatYouWillLearn = JSON.parse(courseData.whatYouWillLearn) || course.whatYouWillLearn;
        course.tag = JSON.parse(courseData.tag) || course.tag;

        const updatedCourse = await course.save();
        console.log("updatedCourse : ", updatedCourse);
        if (!updatedCourse) {
            return res.status(500).json({
                success: false,
                message: "Failed to update course"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Course updated successfully",
            data: updatedCourse
        });

    } catch (error) {
        console.log("Error in edit course : " + error);
        return res.status(501).json({
            success: false,
            message: "Error in edit this course"
        })
    }
}