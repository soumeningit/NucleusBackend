// Import the required modules
const express = require("express")
const router = express.Router()


const { capturePayment, verifyPayment, sendPaymentSuccessEmail } = require("../controller/Payment")
const { auth, isInstructor, isStudent, isAdmin } = require("../middlewares/AuthNMid")
router.post("/capturePayment", auth, capturePayment)
router.post("/verifyPayment", auth, verifyPayment)
router.post("/sendPaymentSuccessEmail", auth, sendPaymentSuccessEmail);

module.exports = router;