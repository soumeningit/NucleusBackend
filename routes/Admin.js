const express = require("express");
const router = express.Router();

const {
    saveMessage,
    createNotifications,
    sendNotification,
    showDraftCourse,
    approveCourse,
    getAllUser
} = require('../controller/Admin');

const { auth, isAdmin } = require('../middlewares/AuthNMid')

router.post("/createmessage", auth, isAdmin, saveMessage);
router.post("/createNotifications", auth, isAdmin, createNotifications);
router.get("/sendNotification", auth, sendNotification);
router.get("/showDraftCourse", auth, isAdmin, showDraftCourse);
router.post("/approveCourse", auth, isAdmin, approveCourse);
router.get("/getalluser", auth, isAdmin, getAllUser);

module.exports = router;