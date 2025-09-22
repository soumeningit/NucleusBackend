const User = require("../models/User");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken");
const OAuthUser = require("../models/OAuthUser");

// This controller expects req.user to be set by Passport after Google OAuth
exports.signInWithGoogle = async (req, res) => {
    try {
        const googleProfile = req.user;
        if (!googleProfile) {
            return res.status(400).json({ error: "No Google profile found" });
        }

        console.log("Google Profile:", googleProfile);

        // Extract info from Google profile
        const email = googleProfile.emails?.[0]?.value;
        const name = googleProfile.displayName;
        const profilePic = googleProfile.photos?.[0]?.value || "";

        let existingUser = await User.findOne({ email });

        const isOAuthUser = existingUser ? existingUser.isOAuthUser : false;

        let data = null;

        if (existingUser && isOAuthUser) {
            // User exists, proceed to login
            console.log("Existing user found:", existingUser);

            data = existingUser;

            const payload = {
                email: data.email,
                id: data._id,
                accountType: data.accountType
            }

            const token = jwt.sign(payload, process.env.JWT_PRIVATEKEY, {
                expiresIn: "2 days" // token will expire in 2 days
            });

            const redirectURL = process.env.FRONTEND_DEV_URL;
            const url = `${redirectURL}/oauth-success/verify?token=${token}&userId=${data._id}&email=${encodeURIComponent(
                data.email
            )}&userName=${encodeURIComponent(name)}&role=${encodeURIComponent(data.accountType)}`;

            return res.redirect(url);


        } else if (existingUser && !isOAuthUser) {
            console.log("Existing non-OAuth user found, linking accounts");
            const newUser = new OAuthUser({
                googleId: googleProfile.id,
                email,
                name
            });
            const response = await newUser.save();

            console.log("OAuthUser created:", response);

            existingUser.oAuthData = response._id;
            existingUser.isOAuthUser = true;
            if (existingUser.password) {
                existingUser.password = undefined;
            }
            data = await existingUser.save();

            console.log("User updated with OAuth data:", data);

            if (!data) {
                return res.status(500).json({ error: "Failed to update user with OAuth data" });
            }

        }
        else {
            console.log("No existing user, creating new user");
            const newUser = new OAuthUser({
                googleId: googleProfile.id,
                email,
                name
            });
            const response = await newUser.save();

            console.log("OAuthUser created:", response);

            const profilesDetails = await Profile.create({
                gender: null,
                dateOfBirth: null,
                about: null,
                contactNumber: null
            });

            const user = await User.create({
                firstName: name,
                email,
                accountType: "Student",
                additionalDetails: profilesDetails._id,
                isOAuthUser: true,
                oAuthData: response._id,
                image: profilePic
            })

            console.log("New user created:", user);

            data = user;

            if (!data) {
                return res.status(500).json({ error: "Failed to create user with OAuth data" });
            }

            console.log("New user created with OAuth data:", data);
        }

        console.log("Final user data:", data);

        const payload = {
            email: data.email,
            id: data._id,
            accountType: data.accountType
        }

        const token = jwt.sign(payload, process.env.JWT_PRIVATEKEY, {
            expiresIn: "2 days" // token will expire in 2 days
        });

        const redirectURL = process.env.FRONTEND_DEV_URL;
        const url = `${redirectURL}/oauth-success/verify?token=${token}&userId=${data._id}&email=${encodeURIComponent(
            data.email
        )}&userName=${encodeURIComponent(name)}&role=${encodeURIComponent(data.accountType)}`;

        return res.redirect(url);

    } catch (error) {
        console.error("Error signing in with Google:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};