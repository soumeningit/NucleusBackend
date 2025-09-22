const express = require("express")
const router = express.Router()
const { auth, isInstructor } = require("../middlewares/AuthNMid")
const {
  updateProfile,
  deleteAccount,
  getAllUserDetails,
  updatePicture,
  getEnrolledCourse,
  instructorDashboard,
  getUserDetails,
  analytics
} = require("../controller/Profile")


router.delete("/deleteProfile", auth, deleteAccount)
router.put("/updateProfile", auth, updateProfile)
router.get("/getAllUserDetails", auth, getAllUserDetails)
router.get("/analytics", auth, isInstructor, analytics)

// Get Enrolled Courses
router.get("/getEnrolledCourse", auth, getEnrolledCourse)
router.put("/updatePicture", auth, updatePicture)
router.get("/instructorDashboard", auth, isInstructor, instructorDashboard)
router.get("/getUserDetails", auth, getUserDetails)

module.exports = router