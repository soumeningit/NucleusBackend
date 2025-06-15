const Category = require("../models/Category");
function getRandomInt(max) {
    return Math.floor(Math.random() * max)
}

exports.createCategory = async (req, res) => {
    try {
        console.log("Inside Create Catagory..")
        // intially no category name present admin create catagory
        // fetch categoryname and description
        const { name, description } = req.body;
        console.log("name : ", name, " description : ", description);
        // validate
        if (!name || !description) {
            return res.status(400)
                .json({
                    error: "Please fill all the fields"
                });
        }
        // create entry in database
        const tag = await Category.create({
            name: name,
            description: description
        });
        console.log(tag);
        // return response
        return res.status(200)
            .json({
                success: true,
                message: "Category created successfully",
            });
    } catch (error) {
        console.log("Catagory generation failed!, please try after some time")
        console.log(error)
        return res.status(400)
            .json({
                success: false,
                message: "Failed!"
            })
    }
}

// get all tags
exports.getAllCategories = async (req, res) => {
    try {
        // need all tags just make sure tags must conatin tag name and tag description.
        console.log("inside getAllCategories inside server")
        const allCategories = await Category.find({}, { name: true, description: true })

        console.log("Get all catagories in server : ", allCategories)

        return res.status(200).json({
            success: true,
            data: allCategories,
        });
    } catch (error) {
        console.log(" Get all Categories failed!, please try after some time")
        console.log(error)
        return res.status(400)
            .json({
                success: false,
                message: "Failed!"
            })
    }
}

exports.categoryPageDetails = async (req, res) => {
    try {
        console.log("inside categoryPageDetails inside server")
        const { categoryId } = req.body
        console.log("PRINTING CATEGORY ID: ", categoryId);
        // Get courses for the specified category
        const selectedCategory = await Category.findById(categoryId)
            .populate({
                path: "course",
                match: { status: "Published" },
                // populate: "ratingAndReviews",
                populate: {
                    path: "instructor",
                    select: "firstName lastName" // Ensure that the instructor's name is included
                }
            })

            .exec()

        console.log("SELECTED COURSE", selectedCategory)
        // Handle the case when the category is not found
        if (!selectedCategory) {
            console.log("Category not found.")
            return res
                .status(404)
                .json({ success: false, message: "Category not found" })
        }
        // Handle the case when there are no courses
        if (selectedCategory.course.length === 0) {
            console.log("No courses found for the selected category.")
            return res.status(404).json({
                success: false,
                message: "No courses found for the selected category.",
            })
        }

        // Get courses for other categories
        const categoriesExceptSelected = await Category.find({
            _id: { $ne: categoryId },
        })
        let differentCategory = await Category.findOne(
            categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]
                ._id
        )
            .populate({
                path: "course",
                match: { status: "Published" },
            })
            .exec()
        //console.log("Different COURSE", differentCategory)
        // Get top-selling courses across all categories
        const allCategories = await Category.find()
            .populate({
                path: "course",
                match: { status: "Published" },
                populate: {
                    path: "instructor",
                },
            })
            .exec()
        const allCourses = allCategories.flatMap((category) => category.courses)
        const mostSellingCourses = allCourses
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 10)
        // console.log("mostSellingCourses COURSE", mostSellingCourses)
        res.status(200).json({
            success: true,
            data: {
                selectedCategory,
                differentCategory,
                mostSellingCourses,
            },
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        })
    }
}