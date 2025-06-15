const Course = require("../models/Course")
const User = require("../models/User")
const { instance } = require("../config/razorpay")
const crypto = require("crypto")
const mailSender = require("../utils/mailSender")
const { CourseEnrollmentEmail } = require("../mail/templates/CourseEnrollmentEmail")
const { PaymentSuccessmail } = require("../mail/templates/PaymentSuccessmail")
const mongoose = require("mongoose");
const { deleteItemFromCart } = require("./Cart")
const CourseProgress = require("../models/CourseProgress")


require("dotenv")

exports.capturePayment = async (req, res) => {
    try {

        console.log("INSIDE CAPTURE PAYMENT INSIDE SERVER....")
        const { courses } = req?.body;
        const userId = req?.user.id;

        console.log("courses inside capturePayment : ", courses);
        console.log("userId inside capturePayment : ", userId);

        if (courses.length === 0) {
            return res.status(400)
                .json({
                    success: false,
                    message: "No courses selected"
                })
        }

        let totalAmount = 0;

        for (let course_id of courses) {
            let course;
            try {
                course = await Course.findById(course_id);

                if (!course) {
                    return res.status(400).json({
                        success: false,
                        message: "Course not found"
                    })
                }
                console.log("course inside capturePayment", course);

                // const uid = new mongoose.Types.ObjectId(userId)
                const uid = new mongoose.Types.ObjectId(userId);

                console.log("uid in capture payment : ", uid);

                if (course.studentsEnrolled.includes(uid)) {
                    return res.status(400)
                        .json({
                            success: false,
                            message: "You have already enrolled in this course"
                        })
                }
                totalAmount += course.price;
                console.log("totalAmount : ", totalAmount)
            } catch (error) {
                console.log("Fetch course errror : " + error)
                return res.status(400)
                    .json({
                        success: false,
                        message: "Error while fetching course details"
                    })
            }
        }

        const options = {
            amount: totalAmount * 100,
            currency: "INR",
            receipt: Math.random(Date.now()).toString()
        };

        const order = await instance.orders.create(options
            //     function (err, order) {
            //     console.log("order in Payment controller: " + order);
            // }
        );

        if (!order) {
            return res.status(400)
                .json({
                    success: false,
                    message: "Error while creating order"
                })
        }

        return res.status(200)
            .json({
                success: true,
                message: "Order created successfully",
                data: order
            })

    } catch (error) {
        console.log("Capture of Payment failed : ", error)
        console.log(error)
        return res.json({
            status: false,
            message: "Capture of Payment failed : " + error
        })
    }
}

exports.verifyPayment = async (req, res) => {
    try {
        console.log("INSIDE VERIFY PAYMENT SERVER....");
        const razorpay_payment_id = req?.body.razorpay_payment_id;
        const razorpay_order_id = req?.body.razorpay_order_id;
        const razorpay_signature = req?.body.razorpay_signature;
        const userId = req?.user.id;
        const { courses } = req?.body;

        console.log("razorpay_payment_id : " + razorpay_payment_id, " razorpay_order_id : " + razorpay_order_id +
            " razorpay_signature : " + razorpay_signature + " userId : " + userId + " courses : " + courses
        )

        const { courseId } = courses;
        console.log("courseId in verify payment : ", courseId);

        if (
            !razorpay_payment_id ||
            !razorpay_order_id ||
            !razorpay_signature ||
            !userId ||
            !courses
        ) {
            console.log("All fields are nedded....")
            toast.error("All fields are nedded....")
        }


        let body = razorpay_order_id + "|" + razorpay_payment_id;
        let expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature == razorpay_signature) {
            await enrolledStudent(userId, courses, res)
            console.log("Payment verified");
            deleteItemFromCart(courseId);
            return res.status(200).json({
                success: true,
                message: "Payment verified successfully",
                payment: true
            })

        }

    } catch (error) {
        console.log("Verification of Payment failed : ", error)
        return res.status(400)
            .json({
                status: false,
                message: "Verification of Payment failed : " + error
            })
    }
}


const enrolledStudent = async (userId, courses, res) => {
    try {
        console.log("enrolledStudent....")
        if (!userId || !courses) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            })
        }

        for (let courseId of courses) {
            try {
                console.log("enrolledStudent....")
                const enrolledCourse = await Course.findOneAndUpdate(
                    { _id: courseId },
                    { $push: { studentsEnrolled: userId } },
                    { new: true },
                )

                // console.log("enrolledCourse inside enrolledStudent: ", enrolledCourse)

                if (!enrolledCourse) {
                    console.log("course not found")
                }

                const courseProgress = await CourseProgress.create({
                    courseId: courseId,
                    userId: userId,
                    courseProgress: []
                })

                const enrolledStudent = await User.findByIdAndUpdate(
                    userId,
                    {
                        $push: {
                            courses: courseId,
                            courseProgress: courseProgress._id
                        },
                    },
                    { new: true }
                )
                // console.log("enrolledStudent inside enrolledStudent: ", enrolledStudent)

                if (!enrolledStudent) {
                    console.log("User not found")
                }

                const emailResponse = await mailSender(
                    enrolledStudent.email,
                    "Order Complete! Starts Learning",
                    CourseEnrollmentEmail(enrolledCourse?.courseName, enrolledStudent?.firstName)
                    // CourseEnrollmentEMail(`${enrolledCourse.courseName}, ${enrolledStudent.firstName}`)
                )

                // console.log("emailResponse : ", emailResponse)


            } catch (error) {
                console.log("Error in enrolledStudent : ", error)
            }

        }

        return {
            success: true,
            message: "All courses enrolled successfully"
        };

    } catch (error) {
        console.log("Enrolled Student failed : ", error)
        return res.status(400)
            .json({
                status: false,
                message: "Enrolled Student failed : " + error
            })
    }
}

exports.sendPaymentSuccessEmail = async (req, res) => {
    try {
        console.log("Inside sendPaymentSuccessEmail in server....")
        const { orederId, paymentId, amount } = req?.body;
        const userId = req?.user.id;

        console.log("orderId, paymentId, amount, userId", orederId, paymentId, amount, userId)

        if (!orederId || !paymentId || !amount || !userId) {

            console.log("Order Id, Payment Id, User Id, and Amount are required")

        }

        try {
            const studentName = await User.findById({ _id: userId });
            console.log("Student Name : ", studentName);

            await mailSender(
                studentName.email,
                "Payment Successfull",
                PaymentSuccessmail(`${studentName.firstName} ${studentName.lastName}`, amount / 100, paymentId, orederId),
            )

            return res.status(200)
                .json({
                    success: true,
                    message: "Payment Successfull",
                })

        }
        catch (e) {
            console.log("Error in sending email : ", e)
        }


    } catch (error) {
        console.log("Error in sendPaymentSuccessEmail : ", error)
        return res.status(400).json({
            success: false,
            message: "Error in sendPaymentSuccessEmail : " + error
        })
    }
}





// capturePayment
// exports.capturePayment = async (req, res) => {
//     try {
//         // fetch user who buy the course and which course user buy
//         const userId = req.user.body;
//         const { courseId } = req.body;
//         // check courseId is valid or not
//         if (!courseId) {
//             return res.status(400)
//                 .json({
//                     message: "Course Id is not valid."
//                 });
//         }

//         // validate course details
//         let course;
//         try {
//             course = await Course.findById(courseId);
//             if (!course) {
//                 return res.json({
//                     success: false,
//                     message: "Course is not found."
//                 })
//             }
//             // Implement next : If user alredy buy that course

//         } catch (error) {
//             console.log(error)
//             return res.status(404).json({
//                 success: false,
//                 message: `Can't Fetch Course Data`,
//                 error: error.message,
//             })
//         }

//         const amount = course.price * 100;
//         let options = {
//             amount,  // amount in the smallest currency unit
//             currency: "INR",
//             receipt: Math.random(Date.now()).toString(),
//             notes: {
//                 courseId,
//                 userId
//             }
//         };

//         try {
//             // Initiate the payment using Razorpay
//             const paymentResponse = await instance.orders.create(options)
//             console.log(paymentResponse)
//             res.json({
//                 success: true,
//                 data: paymentResponse,
//             })
//         } catch (error) {
//             console.log(error)
//             res.status(500)
//                 .json({
//                     success: false,
//                     message: "Could not initiate order."
//                 })
//         }

//     }
//     catch (e) {
//         console.log("payment initoation failed")
//         return res.status(404).json({
//             success: false,
//             message: `failed`,
//             error: error.message,
//         })
//     }
// }

// verify the signature of Razorpay and server
