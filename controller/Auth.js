const User = require("../models/User");
const OTP = require("../models/OTP");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const Profile = require("../models/Profile");
const mailSender = require("../utils/mailSender");

require("dotenv").config();

// Send OTP
exports.sendOTPController = async (req, res) => {
    try {
        // fetch email
        const { email } = req.body;
        console.log("Sending email from user : ", email);
        // check user already exsist or not
        const exsistingUser = await User.findOne({ email });
        // if exsist then send a response
        if (exsistingUser) {
            const data = {
                status: false,
                message: "User already exsist",
                user: -1
            }
            return res
                .json({
                    success: false,
                    message: "User already exsist",
                    data
                })
        }
        // if not exsist then create a new otp
        let generatedOtp = await otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        });
        console.log("generatedOtp : ", generatedOtp)
        // check otp is unique or not
        let exsistingOtp = await OTP.findOne({ otp: generatedOtp });
        // if otp is already present
        while (exsistingOtp) {
            generatedOtp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            });
            exsistingOtp = await OTP.findOne({ generatedOtp });
        }
        // create an entry for otp
        const otpPayload = {
            email,
            otp: generatedOtp
        }
        const otpBody = await OTP.create(otpPayload);
        console.log("otpBody", otpBody)
        // send a successfull response with otp
        res.status(200).json({
            success: true,
            message: "Otp generated Successfully",
            generatedOtp,
        })
    } catch (error) {
        console.log("OTP genaration failed!, please try after some time.");
        console.log(error);
        res.status(500).json({
            success: false,
            message: "OTP genaration failed!"
        })
    }
}

// Sign UP
exports.signUpController = async (req, res) => {
    try {
        console.log("Inside sign up controller..")
        // fecth the data from req ki body
        const { firstName, lastName, email, password,
            confirmPassword, accountType, otp
        } = req.body;
        console.log("Data from frontend : ", req.body);
        // check the all the data are present or not means they are empty or not
        if (!firstName || !lastName || !email
            || !password || !confirmPassword || !accountType
            || !otp) {
            return res.status(403).json({
                success: false,
                message: "Please fill all the details."
            })
        }
        // check password and confirm password are matched or not
        if (password !== confirmPassword) {
            return res.status(403)
                .json({
                    success: false,
                    message: "Passwords are not matched!"
                });
        }
        // check user already exsist or not
        const exsistingUser = await User.findOne({ email });
        // if user exsist then send a error message
        if (exsistingUser) {
            return res.status(403)
                .json({
                    success: false,
                    message: "User already exsist!"
                })
        }
        // fetch most recent otp from db
        const recentOtp = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        console.log("In server Recent Otp Object : ", recentOtp[0].otp);
        console.log("In server Recent Otp  :Value ", recentOtp[0].otp);

        // check otp is matched or not with otp which is send from frontend
        if (recentOtp.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Internal error! Please try after some time."
            })
        }

        console.log("email in db ", recentOtp.email, " email in req ", email, "otp in db ", recentOtp.otp, " otp coming from req ", otp)

        if (recentOtp[0].otp !== otp) {
            return res.status(403).json({
                success: false,
                message: "OTP mismatched, check and fill the correct otp!"
            })
        }
        // if otp is matched then hash the password
        const hashedPassword = await bcrypt.hash(password, 10,);
        // create a user entry in db

        const profilesDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            // contactNumber,
            password: hashedPassword,
            accountType,
            additionalDetails: profilesDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}${lastName}`
        })

        user.password = null;
        // send a successfull response with user data
        res.status(200)
            .json({
                success: true,
                message: "User Registered Successfully",
                user,
            })
    } catch (error) {
        console.log("Registration Failed!")
        console.log(error)
        return res.status(500)
            .json({
                success: false,
                message: "User generation failed"
            });
    }
}

// Log In
exports.logInController = async (req, res) => {
    console.log("Inside login controller..")
    try {
        // fetch email, Password
        const { email, password } = req.body;
        // check email, password is empty or not
        if (!password || !email) {
            return res.status(403)
                .json({
                    success: false,
                    message: "please enter valid email password"
                });
        }
        // check user is registered or not
        let user = await User.findOne({ email }).populate("additionalDetails");
        console.log("user in log in controller : ", user)
        if (!user) {
            return res.status(404)
                .json({
                    success: false,
                    message: "User not exsist, please register first",
                })
        }
        // compare user send password and stored hash password
        const isMatchedPassword = await bcrypt.compare(password, user.password);
        if (isMatchedPassword) {
            // if match then create jwt token
            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType
            }

            const token = jwt.sign(payload, process.env.JWT_PRIVATEKEY, {
                expiresIn: "2h"
            });

            const userData = {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                accountType: user.accountType,
                image: user.image
            }

            // user = user.toObject();
            user.token = token;
            user.password = null;
            // create cookie and send it
            const name = "token";
            const value = token;
            const options = {
                expires: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
                // 4*24*60*60*1000 = 4 days
                httpOnly: true // user can't change the cookie value
            }
            res.cookie(name, value, options).status(200)
                .json({
                    success: true,
                    message: "User logged in successfully",
                    token,
                    user: userData
                })

        }// if password is not matched then send a response password is not matched
        else {
            return res.status(401)
                .json({
                    success: false,
                    message: "Password is not matched, please retry"
                })
        }
    }
    catch (error) {
        console.log("Log in failed");
        console.log(error)
    }
}

// logOut
exports.logOut = async (req, res) => {
    try {
        const token = req.body.token || req.cookies.token;
        console.log("Token inside logout server : ", token);
        if (!token) {
            return res.status(401)
                .json({
                    success: false,
                    message: "User is not logged in"
                })
        }
        res.clearCookie("token").status(200)
            .json({
                success: true,
                message: "User logged out successfully"
            })
    } catch (error) {
        console.log("Log out failed");
        console.log(error)
    }
}

// Change Password
exports.changePasswordController = async (req, res) => {
    try {
        // fetch the data
        const { email, oldPassword, newPassword, confirmPassword } = req.body;
        // get oldPassword, newPassword, confirmPassword
        // check all the data is present or not
        if (!email || !oldPassword || !newPassword || !confirmPassword) {
            return res.status(406)
                .json({
                    success: false,
                    message: "Please fill all the fields"
                })
        }
        // check if the user is present in the database or not
        const user = await User.findOne({ email });
        console.log(user)
        if (!user) {
            return res.status(404)
                .json({
                    success: false,
                    message: "User not found"
                });
        }
        // check if the old password is matched or not
        if (oldPassword !== user.password) {
            return res.status(401)
                .json({
                    success: false,
                    message: "Passeord incorrect!, Please enter correct passwodrd"
                });
        }
        // check if the password is matched or not
        if (newPassword === confirmPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            // update the new password in the dbrd
            const updatedUser = await User.findOneAndUpdate({ email }, { $set: { password: hashedPassword } }, { new: true })
            console.log(updatedUser)

            // Send an email that password updated successfully
            await mailSender(email, "Password Updation", "Password Updated succesfully.")

            // send a response
            return res.status(200)
                .json({
                    success: true,
                    message: "Password updated successfully",
                    data: updatedUser
                })
        }

    } catch (error) {
        console.log("Password updation failed due to server error");
        console.log("Please try after some time");
        console.log(error)
    }
}