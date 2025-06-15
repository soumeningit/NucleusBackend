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
} = require("../controller/Profile")

// ********************************************************************************************************
//                                      Profile routes
// ********************************************************************************************************
// Delete User Account
router.delete("/deleteProfile", auth, deleteAccount)
router.put("/updateProfile", auth, updateProfile)
router.get("/getUserDetails", auth, getAllUserDetails)
// Get Enrolled Courses
router.get("/getEnrolledCourse", auth, getEnrolledCourse)
router.put("/updatePicture", auth, updatePicture)
router.get("/instructorDashboard", auth, isInstructor, instructorDashboard)
router.get("/getUserDetailsById", auth, getUserDetails)

module.exports = router