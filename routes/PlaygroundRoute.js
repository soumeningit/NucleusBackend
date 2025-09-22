const express = require("express")
const router = express.Router()

const {
    generate,
    createQuizTopic,
    getQuizTopics,
    getQuizByTopic,
    evaluateQuizResponse,
    test
} = require("../controller/PlaygroundController");

const { auth } = require("../middlewares/AuthNMid");

router.post("/generate", generate);
router.post("/create-quiz-topic", createQuizTopic);
router.get("/get-quiz-topics", getQuizTopics);
router.get("/get-quiz-by-topic", auth, getQuizByTopic);
router.post("/evaluate-quiz-response", auth, evaluateQuizResponse);
router.get("/test", auth, test);

module.exports = router;