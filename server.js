const express = require("express");
const app = express();

const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");
const contactUsRoute = require("./routes/Contact");
const cartRoutes = require("./routes/Cart");
const dbConnect = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
const adminRoutes = require('./routes/Admin')
const message = require('./routes/Message')
const path = require("path");

dotenv.config();
const PORT = process.env.PORT || 5000;

//database connect
dbConnect();
//middlewares
app.use(express.json());
app.use(cookieParser());
// app.use(
//     cors({
//         origin: "http://localhost:3000",
//         credentials: true,
//     })
// )

const allowedOrigins = [
    "http://localhost:3000", // For local development
    "https://nucleuset-3jhf.onrender.com"  // For Render deployment
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    })
);

app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp",
    })
)
//cloudinary connection
cloudinaryConnect();

//routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/contact", contactUsRoute);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/qanda", message);

//def route

// --------------------------deployment------------------------------

const __dirname1 = path.resolve();

// if (process.env.NODE_ENV === "production") {
//     app.use(express.static(path.join(__dirname1, "/build")));
//     app.get("*", (req, res) =>
//         res.sendFile(path.resolve(__dirname1, "build", "index.html"))
//     );
// } 
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname1, "..", "/client/build")));
    app.get("*", (req, res) =>
        res.sendFile(path.resolve(__dirname1, "..", "client", "build", "index.html"))
    );
} else {
    app.get("/", (req, res) => {
        return res.json({
            success: true,
            message: "Server is running",
        });
    });
}

// --------------------------deployment------------------------------

app.get("/", (req, res) => {
    return res.json({
        success: true,
        message: 'Your server is up and running....'
    });
});

app.listen(PORT, () => {
    console.log(`App is running at ${PORT}`)
})

