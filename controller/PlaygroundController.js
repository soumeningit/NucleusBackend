const { GoogleGenAI } = require("@google/genai");
const QuizQuestion = require("../models/QuizQuestion");
const QuizTopic = require("../models/QuizTopic");
const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const mongoose = require("mongoose");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

exports.generate = async (req, res) => {
    try {
        console.log("Generate endpoint hit");
        console.log("Request Body:", req.body);
        const { topicName, topicId } = req.body;
        console.log("Topic:", topicName, "Topic ID:", topicId);

        if (!topicName || topicName.length === 0) {
            return res.status(400).json({ message: "Topic is required" });
        }

        const topicExists = await QuizTopic.findById(topicId);

        console.log("Topic Exists:", topicExists);

        if (!topicExists) {
            return res.status(400).json({ message: "Invalid topic ID" });
        }

        const prompt = `
                        Generate 10 multiple-choice questions on the topic: ${topicName}.

                        - Divide them into 3 difficulty levels: Easy (3 questions), Medium (4 questions), and Difficult (3 questions).
                        - Each question must have exactly 4 options (A, B, C, D).
                        - Indicate the correct answer for each question.
                        - Return the response strictly in valid JSON format with the following structure:

                        {
                        "questions": [
                            {
                            "difficulty": "Easy" | "Medium" | "Difficult",
                            "question": "string",
                            "options": {
                                "A": "string",
                                "B": "string",
                                "C": "string",
                                "D": "string"
                            },
                            "correct_answer": "A" | "B" | "C" | "D"
                            }
                        ]
                        }

                        Make sure the JSON is properly formatted, without extra text or explanation outside the JSON.
                        `;


        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-001',
            contents: prompt,
        });
        console.log(response.text);

        let output = response.text;

        // Remove code fences if present
        output = output.replace(/```json|```/g, "").trim();

        // Parse JSON safely
        const jsonData = JSON.parse(output);

        const savedDataResponse = await saveQuizData(jsonData, topicId);

        console.log("Saved Data Response:", savedDataResponse);

        if (!savedDataResponse || savedDataResponse.length === 0) {
            return res.status(500).json({ message: "Failed to save quiz data" });
        }

        return res.status(200).json(savedDataResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

async function saveQuizData(quizData, topicId) {
    try {
        const savedData = await QuizQuestion.insertMany(
            quizData.questions.map(q => ({
                difficulty: q.difficulty,
                question: q.question,
                options: q.options,
                quizTopic: topicId,
                correctAnswer: q.correct_answer,
            }))
        );
        return savedData;
    } catch (error) {
        throw error;
    }
}

exports.createQuizTopic = async (req, res) => {
    try {
        const { topic, createdBy } = req.body;
        if (topic.length === 0) {
            return res.status(400).json({ message: "Topic is required" });
        }

        const response = await QuizTopic.insertMany(
            topic.map(t => ({
                name: t.name,
                description: t.description || "",
                category: t.category || "",
                createdBy: createdBy || null,
            }))
        );

        console.log("Created Quiz Topics:", response);

        return res.status(200).json(response);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

exports.getQuizTopics = async (req, res) => {
    try {
        const topics = await QuizTopic.find().sort({ createdAt: -1 });
        return res.status(200).json(topics);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

exports.getQuizByTopic = async (req, res) => {
    try {
        const { topicId } = req.query;
        if (!topicId) {
            return res.status(400).json({ message: "Topic ID is required" });
        }

        const topic = await QuizTopic.findById(topicId);
        if (!topic) {
            return res.status(404).json({ message: "Topic not found" });
        }

        const topicName = topic.name;

        let questions = await QuizQuestion.aggregate([
            { $match: { quizTopic: new mongoose.Types.ObjectId(topicId) } }, // filter by topicId (as ObjectId)
            { $sample: { size: 10 } },          // randomly pick 10
            { $project: { correctAnswer: 0 } }  // exclude correctAnswer field
        ]);

        console.log("Fetched Questions:", questions);

        console.log("Questions type :", typeof questions + " is array : " + Array.isArray(questions) + " " + questions.length);

        if (questions.length === 0) {
            questions = await createQuizQuestion(topicName, topicId);
        }

        const questionsId = questions.map(q => q._id);
        console.log("Question IDs:", questionsId);

        const quiz = new Quiz({
            topic: topicId,
            attemptBy: req.user.id,
            totalQuestions: questions.length,
            questions: questionsId,
            attempts: []
        });

        const quizResponse = await quiz.save();
        console.log("Created Quiz:", quizResponse);
        if (!quizResponse) {
            return res.status(500).json({ message: "Failed to create quiz" });
        }

        const quizAttempt = new QuizAttempt({
            quiz: quizResponse._id,
            user: req.user.id,
            responses: []
        });

        const quizAttemptResponse = await quizAttempt.save();
        console.log("Created Quiz Attempt:", quizAttemptResponse);
        if (!quizAttemptResponse) {
            return res.status(500).json({ message: "Failed to create quiz attempt" });
        }

        // Link attempt to quiz
        quizResponse.attempts.push(quizAttemptResponse._id);
        await quizResponse.save();

        console.log("Final Questions Sent to User:", questions);

        const responseData = {
            quizId: quizResponse._id,
            attemptId: quizAttemptResponse._id,
            questions: questions
        }

        return res.status(200).json(responseData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

exports.evaluateQuizResponse = async (req, res) => {
    try {
        console.log("Evaluate Quiz Response Endpoint Hit");
        const { userAnswers, quizId, attemptId } = req.body;
        if (!userAnswers) {
            return res.status(400).json({ message: "User answers are required" });
        }

        if (!quizId || !attemptId) {
            return res.status(400).json({ message: "Quiz ID and Attempt ID are required" });
        }

        const userId = req.user.id;

        console.log("User Answers:", userAnswers);
        console.log("Quiz ID:", quizId, "Attempt ID:", attemptId, "User ID:", userId);

        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        const attempt = await QuizAttempt.findById(attemptId);
        if (!attempt) {
            return res.status(404).json({ message: "Quiz attempt not found" });
        }

        let score = 0;
        let total = 0;

        let responseDetails = [];
        let attemptedResponses = [];

        // Use Promise.all to fetch all questions in parallel
        await Promise.all(
            Object.entries(userAnswers).map(async ([questionId, answer]) => {
                if (!questionId || !answer) {
                    throw new Error("Invalid answer format");
                }

                const question = await QuizQuestion.findById(questionId);
                if (question) {
                    const correctOption = question.correctAnswer;
                    const isCorrect = (question.options[correctOption] === answer);

                    if (isCorrect) score += 1;
                    total += 1;

                    responseDetails.push({
                        questionId: questionId,
                        question: question.question,
                        selectedAnswer: answer,
                        correctAnswer: question.options[correctOption],
                        isCorrect: isCorrect
                    });

                    attemptedResponses.push({
                        questionId: questionId,
                        selectedAnswer: answer,
                        isCorrect: isCorrect
                    });
                }
            })
        );

        console.log("Score:", score, "Total Questions Answered:", total);
        console.log("Response Details:", responseDetails);
        console.log("Attempted Responses to Save:", attemptedResponses);

        attempt.responses = attemptedResponses;
        attempt.score = score;
        attempt.completedAt = new Date();
        await attempt.save();

        return res.status(200).json({
            score,
            total,
            responseDetails
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};


// it will work for fallback if questions related to the topic is not there
async function createQuizQuestion(topicName, topicId) {
    console.log("Creating quiz questions for topic:", topicName);
    try {

        const prompt = `
                        Generate 10 multiple-choice questions on the topic: ${topicName}.

                        - Divide them into 3 difficulty levels: Easy (3 questions), Medium (4 questions), and Difficult (3 questions).
                        - Each question must have exactly 4 options (A, B, C, D).
                        - Indicate the correct answer for each question.
                        - Return the response strictly in valid JSON format with the following structure:

                        {
                        "questions": [
                            {
                            "difficulty": "Easy" | "Medium" | "Difficult",
                            "question": "string",
                            "options": {
                                "A": "string",
                                "B": "string",
                                "C": "string",
                                "D": "string"
                            },
                            "correct_answer": "A" | "B" | "C" | "D"
                            }
                        ]
                        }

                        Make sure the JSON is properly formatted, without extra text or explanation outside the JSON.
                        `;


        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-001',
            contents: prompt,
        });
        console.log(response.text);

        let output = response.text;

        // Remove code fences if present
        output = output.replace(/```json|```/g, "").trim();

        // Parse JSON safely
        const jsonData = JSON.parse(output);

        const savedDataResponse = await saveQuizData(jsonData, topicId);

        console.log("Saved Data Response:", savedDataResponse);

        if (!savedDataResponse || savedDataResponse.length === 0) {
            return res.status(500).json({ message: "Failed to save quiz data" });
        }

        return savedDataResponse;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

exports.test = async (req, res) => {
    try {
        console.log("Authenticated user:", req.user);

        console.log("User ID:", req.user.id);

        res.status(200).json({ message: "Authenticated access successful", user: req.user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}