const express = require("express")
const router = express.Router()

const {
  createCourse,
  getAllCourses,
  getCoursedetails,
  editCourse,
  getInstructorCourses,
  publishCourse,
  getCourseById,
  createCourseUpdated,
  getAllCoursesUpdated,
  getCourseByIdUpdated,
  getCourseDetailsForEditCourse,
  searchCourses,
  getCourseByCategory,
  markedVideoCompleted,
  getFullCourseDetails,
  generateCourseCertificate
} = require("../controller/Course")

const {
  getAllCategories,
  createCategory,
  categoryPageDetails,
} = require("../controller/Category")

const {
  createSection,
  updateSection,
  deleteSection,
} = require("../controller/Section")

const {
  createSubSection,
  updateSubSection,
  deleteSubSection,
} = require("../controller/SubSection")

const {
  createRating,
  getAverageRating,
  getAllRating,
} = require("../controller/RatingAndReview")

const {
  courseProgress
} = require("../controller/courseProgress");

const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/AuthNMid")

router.post("/createCourse", auth, isInstructor, createCourseUpdated)
router.post("/createSection", auth, isInstructor, createSection)
router.post("/updateSection", auth, isInstructor, updateSection)
router.post("/deleteSection", auth, isInstructor, deleteSection)
router.post("/updateSubSection", auth, isInstructor, updateSubSection)
router.post("/deleteSubSection", auth, isInstructor, deleteSubSection)
router.post("/addSubSection", auth, isInstructor, createSubSection)
router.get("/getAllCourses", getAllCourses)
router.get("/get-all-courses", getAllCoursesUpdated)
router.get("/getCourseDetails", getCoursedetails)
router.post("/publishCourse", auth, isInstructor, publishCourse)
router.post("/editCourse", auth, isInstructor, editCourse)
router.get("/getInstructorCourses", auth, isInstructor, getInstructorCourses)
router.post("/updateCourseProgress", auth, isStudent, courseProgress);
router.get("/getCourseById", auth, isInstructor, getCourseById);
router.get("/get-course-details", getCourseByIdUpdated);
router.get("/get-course-details-for-edit", auth, isInstructor, getCourseDetailsForEditCourse);
router.get("/search", searchCourses);
router.get("/get-courses-by-category", getCourseByCategory);
router.post("/markedVideoCompleted", auth, isStudent, markedVideoCompleted);
router.get("/getFullCourseDetails", auth, getFullCourseDetails);
router.post("/generate-course-certificate", auth, isStudent, generateCourseCertificate);


router.post("/createCategory", auth, isAdmin, createCategory)
router.get("/getAllCategories", getAllCategories)
router.post("/getCategoryPageDetails", categoryPageDetails)

router.post("/createRating", auth, isStudent, createRating)
router.get("/getAverageRating", getAverageRating)
router.get("/getReviews", getAllRating)

module.exports = router
