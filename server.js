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
    'http://localhost:3000',
    'http://localhost:4000',
    'http://localhost:4001',
    'https://nucleus-edte.vercel.app/',
    'https://nucleus-nine-zeta.vercel.app/',
    'https://nucleusbackend.onrender.com'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            let msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
}));

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

app.get("/", (req, res) => {
    return res.json({
        success: true,
        message: "Server is running",
    });
});

app.get("/", (req, res) => {
    return res.json({
        success: true,
        message: 'Your server is up and running....'
    });
});

app.listen(PORT, () => {
    console.log(`App is running at ${PORT}`)
})

