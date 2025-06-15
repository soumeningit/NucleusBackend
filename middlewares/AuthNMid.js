const User = require("../models/User")
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

// auth
exports.auth = async (req, res, next) => {
    try {
        // extract token
        // const token = req.header("Authorization").replace("Bearer ", "") || req.cookies.token || req.body.token
        const token =
            req.cookies.token ||
            req.body.token ||
            (req.header("Authorization") ? req.header("Authorization").replace("Bearer ", "") : null);

        // console.log("Token inside auth middleware : ", token)

        // check if token is prsent or not
        if (!token) {
            return res.status(401)
                .json({
                    success: false,
                    message: "Token is missing"
                })
        }
        // if token is present then verify the token
        try {
            console.log("verifing token..")
            const verifiedToken = jwt.verify(token, process.env.JWT_PRIVATEKEY);
            // console.log("Verified Token ", verifiedToken);
            req.user = verifiedToken;
            next();
        } catch (error) {
            console.log("Error in auth middleware : ", error)
            console.log("Invalid token")
            return res.status(401)
                .json({
                    success: false,
                    message: "Invalid token"
                })
        }
    } catch (error) {
        console.log("Something went wrong, Please try after some time")
        console.log(error)
        return res.status(403)
            .json({
                success: false,
                message: "Token validation failed!"
            })
    }
}

// student
exports.isStudent = async (req, res, next) => {
    try {
        // extarct role
        const role = req.user.accountType;
        console.log("Role ", role)
        if (role !== "Student") {
            return res.status(400)
                .json({
                    success: false,
                    message: "This is protected route for student only, you are not an student"
                })
        }

        next();

    } catch (error) {
        console.log("Something went wrong, Please try after some time")
        console.log(error)
        return res.status(500)
            .json({
                success: false,
                message: "Not a student"
            })
    }
}

// instructor
exports.isInstructor = async (req, res, next) => {
    try {
        console.log("Inside isInstructor middleware : ")
        // extarct role
        const role = req.user.accountType;
        console.log("Role ", role)
        if (role !== "Instructor") {
            return res.status(400)
                .json({
                    success: false,
                    message: "This is protected route for Instructor only, you are not an Instructor"
                })
        }

        next();

    } catch (error) {
        console.log("Something went wrong, Please try after some time")
        console.log(error)
        return res.status(500)
            .json({
                success: false,
                message: "Not an Instructor"
            })
    }
}


// admin
exports.isAdmin = async (req, res, next) => {
    try {
        // extarct role
        const role = req.user.accountType;
        console.log("Role ", role)
        if (role !== "Admin") {
            return res.status(400)
                .json({
                    success: false,
                    message: "This is protected route for Admin only, you are not an Admin"
                })
        }

        next();

    } catch (error) {
        console.log("Something went wrong, Please try after some time")
        console.log(error)
        return res.status(500)
            .json({
                success: false,
                message: "Not an Admin"
            })
    }
}










/*
// Importing required modules
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User");
// Configuring dotenv to load environment variables from .env file
dotenv.config();

// This function is used as middleware to authenticate user requests
exports.auth = async (req, res, next) => {
    try {
        // Extracting JWT from request cookies, body or header
        const token =
            req.cookies.token ||
            req.body.token ||
            req.header("Authorization").replace("Bearer ", "");

        // If JWT is missing, return 401 Unauthorized response
        if (!token) {
            return res.status(401).json({ success: false, message: `Token Missing` });
        }

        try {
            // Verifying the JWT using the secret key stored in environment variables
            const decode = await jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            // Storing the decoded JWT payload in the request object for further use
            req.user = decode;
        } catch (error) {
            // If JWT verification fails, return 401 Unauthorized response
            return res
                .status(401)
                .json({ success: false, message: "token is invalid" });
        }

        // If JWT is valid, move on to the next middleware or request handler
        next();
    } catch (error) {
        // If there is an error during the authentication process, return 401 Unauthorized response
        return res.status(401).json({
            success: false,
            message: `Something Went Wrong While Validating the Token`,
        });
    }
};
exports.isStudent = async (req, res, next) => {
    try {
        const userDetails = await User.findOne({ email: req.user.email });

        if (userDetails.accountType !== "Student") {
            return res.status(401).json({
                success: false,
                message: "This is a Protected Route for Students",
            });
        }
        next();
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: `User Role Can't be Verified` });
    }
};
exports.isAdmin = async (req, res, next) => {
    try {
        const userDetails = await User.findOne({ email: req.user.email });

        if (userDetails.accountType !== "Admin") {
            return res.status(401).json({
                success: false,
                message: "This is a Protected Route for Admin",
            });
        }
        next();
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: `User Role Can't be Verified` });
    }
};
exports.isInstructor = async (req, res, next) => {
    try {
        const userDetails = await User.findOne({ email: req.user.email });
        console.log(userDetails);

        console.log(userDetails.accountType);

        if (userDetails.accountType !== "Instructor") {
            return res.status(401).json({
                success: false,
                message: "This is a Protected Route for Instructor",
            });
        }
        next();
    } catch (error) {
        return res
            .status(500)
            .json({ success: false, message: `User Role Can't be Verified` });
    }
};
*/