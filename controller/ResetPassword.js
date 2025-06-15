const User = require("../models/User")
const bcrypt = require("bcrypt")
const mailSender = require("../utils/mailSender")
const crypto = require("crypto")
const { passwordReset } = require("../mail/templates/passwordReset")

// reset Pasword token
exports.resetPasswordToken = async (req, res) => {
    try {
        // fetch the data, get the email
        const { email } = req.body;
        // check if the email exists
        if (!email) {
            return res.status(404)
                .json({
                    success: false,
                    message: "Please enter an email address."
                })
        }
        // user is present or not
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404)
                .json({
                    success: false,
                    message: "No user found with this email address."
                })
        }
        /*
        // generate token
        const uuid = crypto.randomUUID(); // string containing a randomly generated, 36 character long v4 UUID.Used for cryptography, it generate random number.
        console.log(uuid);
        // save the token in the database
        const token = await User.findOneAndUpdate({ email: email }, {
            email: email,
            token: uuid,
            resetTokenTime: Date.now() + 2 * 60 * 1000
        },
            { new: true })
        // create url
        // const url = `http://localhost:3000/update-password/${token}`
        // send the url to the email
        await mailSender(email, "Password Reset Link", `Password reset link :${url}`)*/

        const token = crypto.randomBytes(20).toString("hex");

        const updatedDetails = await User.findOneAndUpdate(
            { email: email },
            {
                token: token,
                resetPasswordExpires: Date.now() + 3600000,
            },
            { new: true }
        );
        console.log("DETAILS", updatedDetails);
        const url = `http://localhost:3000/update-password/${token}`;
        // const url = process.env.NODE_ENV === "production"
        //     ? `https://nucleus-nine-zeta.vercel.app/update-password/${token}`
        //     : `http://localhost:3000/update-password/${token}`;

        await mailSender(
            email,
            "Password Reset",
            passwordReset(url)
        );
        // return the response
        return res.status(200)
            .json({
                success: true,
                message: "Password reset link send to your registered mail id"
            })
    } catch (error) {
        console.log("Problems occured sending mail, please try after some time")
        console.log(error)
        return res.status(500)
            .json({
                success: false,
                message: "Mail sending, failed"
            })
    }
}

// reset Password
exports.resetPassword = async (req, res) => {
    try {
        // fetch data
        const { password, confirmPassword, token } = req.body;
        // validate
        console.log("inside reset-password in server ", "password : ", password, "confirmPassword : ", confirmPassword, " token : ", token)
        if (!password || !confirmPassword || !token) {
            return res.status(400)
                .json({
                    success: false,
                    message: "Please fill all the details."
                })
        }
        // validate password
        if (password != confirmPassword) {
            return res.status(400)
                .json({
                    success: false,
                    message: "Passwords are mismatched"
                })
        }
        // get userdetails
        const userDetails = await User.findOne({ token });
        // check user is present or not
        if (!userDetails) {
            return res.status(400)
                .json({
                    success: false,
                    message: "Invalid token, User not found"
                })
        }
        // token time check
        if (userDetails.tokenExpireTime < Date.now()) {
            return res.status(408)
                .json({
                    success: false,
                    message: "Token expired, please retry"
                });
        }
        // hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // update into db
        await User.findOneAndUpdate({ token: token }, { password: hashedPassword }, { new: true })
        // send response
        return res.status(200)
            .json({
                success: true,
                message: "Password reset successfully"
            })

    } catch (e) {
        console.log("Reset Password failed!, please try after some time")
        console.log(e)
        return res.status(400)
            .json({
                success: false,
                message: "Reset password process failed!"
            })
    }
}