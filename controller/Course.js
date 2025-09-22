const Course = require("../models/Course")
const Category = require("../models/Category")
const Section = require("../models/Section")
const SubSection = require("../models/SubSection")
const User = require("../models/User")
const { uploadFileToCloudinary } = require("../utils/fileUploader")
// const CourseProgress = require("../models/CourseProgress")
const Announcements = require("../models/Announcement")
const Admin = require("../models/Admin")
const CourseProgress = require("../models/CourseProgress")
const OAuthUser = require("../models/OAuthUser")
const Certificate = require("../models/Certificate")
const crypto = require("crypto")
const { generateCertificate } = require("../utils/GenerateCertificate");
const fs = require("fs");
const path = require("path");
const os = require("os");
const generateCertificateImage = require("../utils/GenerateCertificateImage")
const { default: mongoose } = require("mongoose")

const generateCertificateIdWithCrypto = (userId) => {
    // Method 2: Using crypto for more secure random generation
    const randomBytes = crypto.randomBytes(4).toString('hex').toUpperCase();
    const timestamp = Date.now().toString(10).toUpperCase();
    return `CERT-${timestamp}-${randomBytes}-${userId.slice(-4).toUpperCase()}`;
};

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
        const { courseId } = req.query;
        console.log("Insiside server getCoursedetails courseId : ", courseId)

        const courseDetails = await Course.findOne({
            _id: courseId,
        })
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                    model: "SubSection"
                }
            })
            .populate({
                path: "instructor",
                select: "firstName lastName email image",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")

            // .populate("ratingAndReviews")
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
                data: courseDetails,
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
        })
            .select("courseName courseDescription price status category createdAt duration thumbnail progress")
            .populate("category", "name description")
            .populate({
                path: "instructor",
                select: "firstName lastName email image",
            }).sort({ createdAt: -1 });

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
            console.log("Adding courseId to admin:", courseId);
            admin.courseIds.push(courseId);
            const saveResp = await admin.save(); // Save the updated document
            console.log("saveResp : ", saveResp);
            return res.status(200).json({
                success: true,
                message: `Course added successfully`
            });
        } else {
            console.log("Course already exists");
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

exports.createCourseUpdated = async (req, res) => {
    try {
        console.log("Inside createCourseUpdated....");
        const userId = req.user.id;
        console.log("userId in createCourseUpdated : " + userId);
        if (!userId) {
            return res.status(404).json({
                success: false,
                message: "UserId is Required"
            })
        }

        const userDetails = await User.findById(userId);
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        console.log("userDetails : " + userDetails);

        let {
            courseName,
            shortDescription,
            detailedDescription,
            category,
            price,
            whatYouWillLearn,
            tags,
            prerequisites
        } = req.body;

        console.log("courseName, shortDescription, detailedDescription, category, price, whatYouWillLearn, tags, prerequisites : ",
            courseName, shortDescription, detailedDescription, category, price, whatYouWillLearn, tags, prerequisites);

        if (!courseName || !shortDescription || !detailedDescription ||
            !category || !price || whatYouWillLearn.length === 0 ||
            tags.length === 0 || prerequisites.length === 0) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        const categoryDetails = await Category.findById(category);
        if (!categoryDetails) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            })
        }

        console.log("categoryDetails : " + categoryDetails);

        const thumbnail = req.files ? req.files.thumbnail : null;

        let thumbnailUrl = "";
        if (thumbnail) {
            const uploadResponse = await uploadFileToCloudinary(thumbnail, process.env.FOLDER_NAME);
            console.log("uploadResponse : " + uploadResponse);
            thumbnailUrl = uploadResponse.secure_url;
        }

        const newCourse = await Course.create({
            courseName,
            shortDescription,
            courseDescription: detailedDescription,
            instructor: userDetails._id,
            category: categoryDetails._id,
            price,
            whatYouWillLearn: JSON.parse(whatYouWillLearn),
            tag: JSON.parse(tags),
            thumbnail: thumbnailUrl,
            instructions: JSON.parse(prerequisites),
            status: "Draft"
        });

        console.log("newCourse : " + newCourse);
        if (!newCourse) {
            return res.status(500).json({
                success: false,
                message: "Failed to create course"
            })
        }

        userDetails.courses.push(newCourse._id);
        const updatedUser = await userDetails.save();
        console.log("updatedUser : " + updatedUser);

        return res.status(201).json({
            success: true,
            message: "Course created successfully",
            data: newCourse._id
        });

    } catch (error) {
        console.log("Error in createCourseUpdated : " + error);
        return res.status(501).json({
            success: false,
            message: "Error in createCourseUpdated"
        })
    }
}

exports.getAllCoursesUpdated = async (req, res) => {
    try {
        console.log("Inside get all courses updated....");

        // Get query params
        const { page = 1, limit = 10 } = req.query;
        const pageNumber = parseInt(page, 10);
        const pageLimit = parseInt(limit, 10);

        // Count total documents
        const totalCourses = await Course.countDocuments();

        // Fetch paginated data (skip/limit)
        const courses = await Course.find({})
            .populate({
                path: "instructor",
                select: "firstName lastName email image", // only instructor details
            })
            .select(
                "courseName courseDescription shortDescription thumbnail price tag status createdAt duration"
            )
            .skip((pageNumber - 1) * pageLimit)
            .limit(pageLimit)
            .sort({ createdAt: -1 }); // latest courses first

        res.status(200).json({
            success: true,
            data: courses,
            pagination: {
                totalCourses,
                currentPage: pageNumber,
                totalPages: Math.ceil(totalCourses / pageLimit),
                hasMore: pageNumber < Math.ceil(totalCourses / pageLimit),
            },
        });
    } catch (error) {
        console.error("Error fetching paginated courses:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch courses",
            error: error.message,
        });
    }
};

exports.getCourseByIdUpdated = async (req, res) => {
    try {
        console.log("Inside get course by Id updated....");
        const { courseId } = req.query;
        console.log("courseId : " + courseId);
        if (!courseId) {
            return res.status(404).json({
                success: false,
                message: "CourseId is Required"
            })
        }
        const course = await Course.findById({ _id: courseId })
            .populate({
                path: "instructor",
                select: "firstName lastName email image additionalDetails",
                populate: {
                    path: "additionalDetails",
                    select: "about"
                }
            })
            .populate("category", "name description")
            .populate({
                path: "courseContent",
                select: "sectionName subSection",
                populate: {
                    path: "subSection",
                    select: "title duration"
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
        console.log("Error in get course by Id updated : " + error);
        return res.status(501).json({
            success: false,
            message: "Error in get this course"
        })
    }
}

exports.getCourseDetailsForEditCourse = async (req, res) => {
    try {
        console.log("Inside get course details for edit....");

        const userId = req.user.id;
        console.log("userId in getCourseDetailsForEdit : " + userId);
        if (!userId) {
            return res.status(404).json({
                success: false,
                message: "UserId is Required"
            })
        }

        const { courseId } = req.query;
        console.log("courseId : " + courseId);
        if (!courseId) {
            return res.status(404).json({
                success: false,
                message: "CourseId is Required"
            })
        }

        const course = await Course.findOne({
            _id: courseId,
            instructor: userId
        })
            .populate("category", "name description")
            .populate({
                path: "courseContent",
                select: "sectionName subSection",
                populate: {
                    path: "subSection",
                    select: "title duration videoUrl"
                }
            });

        console.log("course : " + course);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found or you are not authorized to edit this course",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Course details for edit fetched successfully",
            data: course,
        });

    } catch (error) {
        console.log("Error in get course details for edit : " + error);
        return res.status(501).json({
            success: false,
            message: "Error in get course details for edit"
        })
    }
}

exports.searchCourses = async (req, res) => {
    try {
        console.log("Inside search courses....");
        const { query } = req.query || "";
        if (query.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            });
        }

        const response = await Course.aggregate([
            // join instructor data
            {
                $lookup: {
                    from: "users", // name of User collection
                    localField: "instructor",
                    foreignField: "_id",
                    as: "instructorDetails"
                }
            },
            { $unwind: "$instructorDetails" },

            // match against fields
            {
                $match: {
                    $or: [
                        { courseName: { $regex: query, $options: "i" } },
                        { shortDescription: { $regex: query, $options: "i" } },
                        { courseDescription: { $regex: query, $options: "i" } },
                        { tag: { $regex: query, $options: "i" } }, // works if tag is array of strings
                        { "instructorDetails.firstName": { $regex: query, $options: "i" } }
                    ]
                }
            },

            // optional: project only required fields
            {
                $project: {
                    courseName: 1,
                    shortDescription: 1,
                    courseDescription: 1,
                    tag: 1,
                    thumbnail: 1,
                    price: 1,
                    "instructorDetails.firstName": 1,
                    "instructorDetails.lastName": 1,
                }
            }
        ]);

        console.log("search response : ", response);

        return res.status(200).json({
            success: true,
            message: "Search results fetched successfully",
            data: response
        });

    } catch (error) {
        console.log("Error in search courses : " + error);
        return res.status(501).json({
            success: false,
            message: "Error in search courses"
        })
    }
}

exports.getCourseByCategory = async (req, res) => {
    try {
        console.log("Inside get course by category....");
        const { categoryId } = req.query;
        console.log("categoryId : " + categoryId);
        if (!categoryId) {
            return res.status(404).json({
                success: false,
                message: "CategoryId is Required"
            })
        }
        const courses = await Course.find({ category: categoryId, status: "Published" })
            .select("courseName courseDescription shortDescription thumbnail price tag status createdAt duration")
            .populate({
                path: "instructor",
                select: "firstName lastName"
            });

        if (!courses || courses.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No courses found for this category"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Courses fetched successfully",
            data: courses
        });

    } catch (error) {
        console.log("Error in get course by category : " + error);
        return res.status(501).json({
            success: false,
            message: "Error in get course by category"
        })
    }
}

exports.markedVideoCompleted = async (req, res) => {
    try {
        console.log("Inside marked video completed....");
        const userId = req.user.id;
        console.log("userId in markedVideoCompleted : " + userId);
        if (!userId) {
            return res.status(404).json({
                success: false,
                message: "UserId is Required"
            })
        }

        const { courseId, completedLectures } = req.body;

        if (!courseId) {
            return res.status(404).json({
                success: false,
                message: "CourseId is Required"
            })
        }

        if (!completedLectures || completedLectures.length === 0) {
            return res.status(404).json({
                success: false,
                message: "completedLectures is Required"
            })
        }

        console.log("courseId, completedLectures : ", courseId, completedLectures);

        const course = await Course.findById(courseId)
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                }
            });

        console.log("course : " + course);

        if (!course) {
            return res.status(404).json({
                success: false,
                message: "Course not found",
            });
        }

        const totalLectures = course.courseContent.reduce((total, section) => total + section.subSection.length, 0);
        console.log("totalLectures : " + totalLectures);

        const progressPercentage = Math.round((completedLectures.length / totalLectures) * 100);

        console.log("progressPercentage : " + progressPercentage);

        let courseProgress = await CourseProgress.findOne({
            userId: userId,
            courseId: courseId
        });

        if (!courseProgress) {
            console.log("Creating new course progress record");
            const newCourseProgress = await CourseProgress.create({
                userId: userId,
                courseId: courseId,
                completedVideos: [],
                lastWatched: null,
                progressPercentage: 0
            });
            courseProgress = newCourseProgress;
            console.log("newCourseProgress : " + newCourseProgress);
        }


        console.log("courseProgress : " + courseProgress);

        for (const subSectionId of completedLectures) {
            console.log("subSectionId : " + subSectionId);
            if (!courseProgress.completedVideos.includes(subSectionId)) {
                courseProgress.completedVideos.push(subSectionId);
                courseProgress.lastWatched = subSectionId;
            }
        }

        courseProgress.progressPercentage = progressPercentage;

        const updatedCourseProgress = await courseProgress.save();

        console.log("updatedCourseProgress : " + updatedCourseProgress);

        return res.status(200).json({
            success: true,
            message: "Course progress updated successfully",
            data: updatedCourseProgress
        });


    } catch (error) {
        console.log("Error in marked video completed : " + error);
        return res.status(501).json({
            success: false,
            message: "Error in marked video completed"
        })
    }
}

exports.getFullCourseDetails = async (req, res) => {
    try {
        console.log("Inside getFullCourseDetails....");
        const { courseId } = req.query;
        console.log("courseId : " + courseId);

        if (!courseId) {
            return res.status(404).json({
                success: false,
                message: "CourseId is Required"
            })
        }

        const userId = req.user.id;
        console.log("userId in getFullCourseDetails : " + userId);

        const courseDetails = await Course.findOne({
            _id: courseId,
        })
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                    model: "SubSection"
                }
            })
            .populate({
                path: "instructor",
                select: "firstName lastName email image",
                populate: {
                    path: "additionalDetails",
                },
            })
            .populate("category")

            // .populate("ratingAndReviews")
            .exec();

        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: `Could not find the course with course id ${courseId}`
            })
        }

        let courseProgress = await CourseProgress.findOne({
            userId: userId,
            courseId: courseId
        });

        if (!courseProgress) {
            console.log("No course progress found for this user and course");
            courseProgress = {
                completedVideos: [],
                lastWatched: null,
                progressPercentage: 0
            };
        }

        return res.status(200)
            .json({
                success: true,
                message: "Full Course Details Fetched Successfully",
                data: {
                    courseDetails,
                    courseProgress
                },
            });
    } catch (error) {
        console.log("Could not find the course details")
        console.log(error)
        return res.status(401)
            .json({
                success: false,
                message: `Could not find the course details`,
            });
    }
}

exports.generateCourseCertificate = async (req, res) => {
    try {
        console.log("Inside generate course certificate....");

        const userId = req.user.id;
        const courseId = req.body.courseId;

        console.log("userId : " + userId);
        console.log("courseId : " + courseId);

        if (!userId) {
            return res.status(404).json({
                success: false,
                message: "UserId is Required"
            })
        }

        if (!courseId) {
            return res.status(404).json({
                success: false,
                message: "CourseId is Required"
            })
        }
        const userDetails = await User.findById(userId);
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        const courseDetails = await Course.findById(courseId)
            .populate({
                path: "instructor",
                select: "firstName lastName isOAuthUser oAuthData",
                populate: {
                    path: "oAuthData",
                    select: "name"
                }
            });
        if (!courseDetails) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            })
        }

        console.log("courseDetails : " + courseDetails);

        const isCertificateAlreadyGenerated = await Certificate.findOne({
            user: userId,
            course: courseId
        });

        if (isCertificateAlreadyGenerated) {
            const data = {
                certificateId: isCertificateAlreadyGenerated?.certificateId,
                certificateUrl: isCertificateAlreadyGenerated?.file
            }

            return res.status(200).json({
                success: true,
                message: "Certificate already generated",
                data: data
            });
        }

        const instructorDetails = courseDetails.instructor;
        if (!instructorDetails) {
            return res.status(404).json({
                success: false,
                message: "Instructor not found"
            })
        }

        console.log("instructorDetails : " + instructorDetails);

        let instructorName = "";
        if (instructorDetails.isOAuthUser) {
            instructorName = instructorDetails.oAuthData.name;
        } else {
            instructorName = `${instructorDetails.firstName} ${instructorDetails.lastName}`;
        }

        console.log("instructorName : " + instructorName);

        const isStudentEnrolled = courseDetails.studentsEnrolled.includes(userId);
        if (!isStudentEnrolled) {
            return res.status(403).json({
                success: false,
                message: "You are not enrolled in this course"
            })
        }

        const courseProgress = await CourseProgress.findOne({
            userId: userId,
            courseId: courseId
        });

        if (!courseProgress || courseProgress.progressPercentage < 100) {
            return res.status(400).json({
                success: false,
                message: "You have not completed the course yet"
            })
        }

        const isOAuthUser = userDetails.isOAuthUser ? true : false;
        let userName = "";
        if (isOAuthUser) {
            const oAuthId = userDetails.oAuthData;
            console.log("oAuthId : " + oAuthId);

            const oauthData = await OAuthUser.findById(oAuthId);
            if (oauthData) {
                userName = oauthData.name;
            }
        }

        userName = userName === "" ? `${userDetails.firstName} ${userDetails.lastName}` : userName;

        console.log("userName : " + userName);

        // Generate unique certificate ID
        const certificateId = generateCertificateIdWithCrypto(userId);
        console.log("Generated certificate ID: " + certificateId);

        const certificate = await generateCertificateImage(
            userName,
            courseDetails.courseName,
            instructorName,
            certificateId,
        )

        console.log("Generated certificate image buffer");

        const tempFilePath = path.join(os.tmpdir(), `certificate-${certificateId}.pdf`);
        fs.writeFileSync(tempFilePath, certificate);

        // Upload to Cloudinary
        const uploadResponse = await uploadFileToCloudinary({ tempFilePath }, process.env.FOLDER_NAME);
        fs.unlinkSync(tempFilePath); // Delete the temporary file

        const certificateUrl = uploadResponse.secure_url;

        console.log("certificateUrl : " + certificateUrl);

        const certificateData = await Certificate.create({
            user: userDetails._id,
            course: courseDetails._id,
            instructor: instructorDetails._id,
            dateOfIssue: new Date(),
            certificateId: certificateId,
            file: certificateUrl
        });

        console.log("certificateData : " + certificateData);

        if (!certificateData) {
            return res.status(500).json({
                success: false,
                message: "Failed to generate certificate"
            })
        }

        const data = {
            certificateId: certificateData?.certificateId,
            certificateUrl: certificateData?.file
        }

        return res.status(200).json({
            success: true,
            message: "Certificate generated successfully",
            data: data
        });

    } catch (error) {
        console.log(JSON.stringify(error));
        console.log("Error in generate course certificate : " + error);
        return res.status(501).json({
            success: false,
            message: "Error in generate course certificate"
        })
    }
}
