const express = require("express");
const router = express.Router();

const { createMessage, createReply, showAllQuestion, showAllReply } = require("../controller/Message");
const { auth, isStudent } = require("../middlewares/AuthNMid");

router.post("/createQuestion", auth, createMessage);
router.post("/createReply", auth, createReply);
router.get("/getAllQuestions", auth, showAllQuestion);
router.post("/showAllReply", auth, showAllReply);

module.exports = router;