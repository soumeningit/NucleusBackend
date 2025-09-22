const express = require("express");
const router = express.Router();

const {
    createNewCategory,
    getAllCategories
} = require("../controller/Category");

router.post("/create-category", createNewCategory);
router.get("/get-all-categories", getAllCategories);

module.exports = router;