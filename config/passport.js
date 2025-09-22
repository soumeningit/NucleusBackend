const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

require("dotenv").config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_OAUTH_CLIENT_ID,
            clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL
        },
        (accessToken, refreshToken, profile, done) => {
            // Just pass Google profile to controller
            console.log("Access Token:", accessToken);
            console.log("Refresh Token:", refreshToken);
            console.log("Google profile received in strategy:", profile);
            return done(null, profile);
        }
    )
);

// Since we’re not persisting sessions, these can just pass through
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});
