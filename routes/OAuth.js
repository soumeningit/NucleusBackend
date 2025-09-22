const express = require("express");
const passport = require("passport");
const router = express.Router();

const { signInWithGoogle } = require("../controller/OAuth");

// Step 1: Start Google OAuth
router.get("/signin/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// Step 2: Handle Google callback
router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login", session: false }),
    signInWithGoogle
);

module.exports = router;
