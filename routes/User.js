// Import the required modules
const express = require("express")
const router = express.Router()

// Import the required controllers and middleware functions
const {
  logInController,
  signUpController,
  sendOTPController,
  changePasswordController,
  logOut
} = require("../controller/Auth")
const {
  resetPasswordToken,
  resetPassword,
} = require("../controller/ResetPassword")

const { auth } = require("../middlewares/AuthNMid")

// Routes for Login, Signup, and Authentication

// ********************************************************************************************************
//                                      Authentication routes
// ********************************************************************************************************

// Route for user login
router.post("/login", logInController)

// Route for user signup
router.post("/signup", signUpController)

// Route for sending OTP to the user's email
router.post("/sendotp", sendOTPController)

// Route for Changing the password
router.post("/changepassword", auth, changePasswordController)

// Route for logout
router.post("/logout", logOut)

// ********************************************************************************************************
//                                      Reset Password
// ********************************************************************************************************

// Route for generating a reset password token
router.post("/reset-password-token", resetPasswordToken)

// Route for resetting user's password after verification
router.post("/reset-password", resetPassword)

// Export the router for use in the main application
module.exports = router